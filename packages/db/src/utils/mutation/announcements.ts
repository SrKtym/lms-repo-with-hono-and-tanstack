import { and, eq } from "drizzle-orm";
import { db } from "../../index";
import {
	announcements,
	courses,
	emailNotificationSettings,
	notifications,
	registration,
	user,
	userNotifications,
} from "../../schema";
import type { Announcements } from "../../types";

// アナウンスメント作成
export async function createAnnouncements(announcementsData: Announcements) {
	try {
		const result = await db.transaction(async (tx) => {
			// アナウンスメントの作成と取得
			const [result] = await tx
				.insert(announcements)
				.values(announcementsData)
				.returning({
					title: announcements.title,
					description: announcements.description,
					type: announcements.type,
					courseId: announcements.courseId,
				})
				.onConflictDoNothing();

			const courseId = result?.courseId;

			if (!courseId) {
				return { message: "講義が見つかりません", status: 404 };
			}

			// 講義名と受講者IDを取得
			const courseData = await tx
				.select({
					name: courses.name,
					studentId: registration.userId,
				})
				.from(courses)
				.innerJoin(registration, eq(courses.id, registration.courseId))
				.where(eq(courses.id, courseId));

			// 通知データ
			const notificationsData = {
				title: `${courseData[0]?.name}に新しいお知らせ: ${result.title}`,
				description: `${result.type}: ${result.description}`,
				type: "announcement",
			};

			// 通知の作成
			const [data] = await tx
				.insert(notifications)
				.values(notificationsData)
				.returning({
					id: notifications.id,
				})
				.onConflictDoNothing();

			if (data) {
				const userNotificationData = courseData.map((course) => ({
					userId: course.studentId,
					notificationId: data.id,
				}));
				await tx
					.insert(userNotifications)
					.values(userNotificationData)
					.onConflictDoNothing();
			}

			// メール通知を有効にしているユーザーのメール一覧
			const res = await tx
				.select({
					email: user.email,
				})
				.from(user)
				.innerJoin(
					emailNotificationSettings,
					eq(user.id, emailNotificationSettings.userId),
				)
				.innerJoin(
					registration,
					eq(emailNotificationSettings.userId, registration.userId),
				)
				.where(
					and(
						eq(registration.courseId, courseId),
						eq(emailNotificationSettings.announcementsEmail, true),
					),
				);

			const emails = res.map(({ email }) => email);

			const { courseId: _, ...rest } = result;

			const merged = { ...rest, emails };

			return merged;
		});
		return result;
	} catch {
		return { message: "アナウンスメントの作成に失敗しました。", status: 500 };
	}
}

// アナウンスメント更新
export async function updateAnnouncements(announcementsData: Announcements) {
	try {
		await db.update(announcements).set(announcementsData);
		return { message: "アナウンスメントの更新に成功しました。", status: 200 };
	} catch {
		return { message: "アナウンスメントの更新に失敗しました。", status: 500 };
	}
}

// アナウンスメント削除
export async function deleteAnnouncements(id: string) {
	try {
		await db.delete(announcements).where(eq(announcements.id, id));
		return { message: "アナウンスメントの削除に成功しました。", status: 200 };
	} catch {
		return { message: "アナウンスメントの削除に失敗しました。", status: 500 };
	}
}
