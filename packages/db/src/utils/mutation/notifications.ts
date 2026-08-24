import { and, eq, gt, inArray, lte } from "drizzle-orm";
import { db } from "../../index";
import {
	assignments,
	courses,
	emailNotificationSettings,
	notifications,
	registration,
	user,
	userNotifications,
} from "../../schema";

// 通知を削除
export async function deleteNotification(
	userId: string,
	notificationId?: string,
) {
	try {
		await db
			.delete(userNotifications)
			.where(
				and(
					eq(userNotifications.userId, userId),
					notificationId
						? eq(userNotifications.notificationId, notificationId)
						: undefined,
				),
			);

		return { message: "通知の削除に成功しました。", status: 200 };
	} catch {
		return { error: "通知の削除に失敗しました。", status: 500 };
	}
}

// 通知を既読にする
export async function markNotificationAsRead(
	userId: string,
	notificationId?: string,
) {
	try {
		await db
			.update(userNotifications)
			.set({ isRead: true })
			.where(
				and(
					eq(userNotifications.userId, userId),
					notificationId
						? eq(userNotifications.notificationId, notificationId)
						: undefined,
				),
			);

		return { message: "通知の既読処理に成功しました。", status: 200 };
	} catch {
		return { error: "通知の既読処理に失敗しました。", status: 500 };
	}
}

// リマインダーの作成（認証なし、全ユーザー対象）
export async function createReminder() {
	const now = new Date();

	// 3日後
	const target = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

	try {
		const result = await db.transaction(async (tx) => {
			// 現在日時よりも後で、3日後の日時より前の課題を取得
			const tasks = await tx
				.select({
					title: assignments.title,
					description: assignments.description,
					dueDate: assignments.dueDate,
					courseId: courses.id,
				})
				.from(assignments)
				.innerJoin(courses, eq(assignments.courseId, courses.id))
				.where(
					and(lte(assignments.dueDate, target), gt(assignments.dueDate, now)),
				);

			if (tasks.length === 0) {
				return { error: "該当する課題が見つかりません。", status: 404 };
			}

			const courseIds = tasks.map((v) => v.courseId);

			// 講義名と受講者IDを取得
			const courseData = await tx
				.select({
					studentId: registration.userId,
				})
				.from(courses)
				.innerJoin(registration, eq(courses.id, registration.courseId))
				.where(inArray(courses.id, courseIds));

			const studentIds = courseData.map((v) => v.studentId);

			// 通知データ
			const notificationsData = tasks.map((v) => ({
				title: `リマインダー: 課題（${v.title})`,
				description: v.description,
				type: "system",
			}));

			// リマインダー通知をデータベースに保存
			const dataList = await tx
				.insert(notifications)
				.values(notificationsData)
				.returning({
					id: notifications.id,
				})
				.onConflictDoNothing();

			if (dataList.length > 0) {
				const userNotificationData = dataList.flatMap((data) =>
					studentIds.map((studentId) => ({
						userId: studentId,
						notificationId: data.id,
					})),
				);
				await tx.insert(userNotifications).values(userNotificationData);
			}

			// 各講義を登録しており、かつメール通知を有効にしているユーザーのメールアドレスを取得
			const userEmailsByCourse = await tx
				.select({ email: user.email })
				.from(registration)
				.innerJoin(user, eq(registration.userId, user.id))
				.innerJoin(
					emailNotificationSettings,
					and(
						eq(user.id, emailNotificationSettings.userId),
						eq(emailNotificationSettings.remindersEmail, true),
					),
				)
				.where(inArray(registration.courseId, courseIds));

			const emails = userEmailsByCourse.map((user) => user.email);

			// メール通知を有効にしているユーザーのリマインダー情報
			const reminders = tasks.map(({ courseId, ...rest }) => ({
				...rest,
			}));

			return { emails, reminders };
		});

		return result;
	} catch {
		return { error: "リマインダーの作成に失敗しました。", status: 500 };
	}
}
