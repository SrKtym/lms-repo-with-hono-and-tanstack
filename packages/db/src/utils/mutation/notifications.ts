import { and, eq, gt, inArray, lte } from "drizzle-orm";
import { db } from "../../index";
import {
	assignments,
	courses,
	emailNotificationSettings,
	notifications,
	registration,
	user,
} from "../../schema";
import type { Notifications } from "../../types";

export async function createNotifications(notificationsData: Notifications) {
	try {
		await db.insert(notifications).values(notificationsData);
		return { message: "通知の作成に成功しました。", status: 201 };
	} catch {
		return { message: "通知の作成に失敗しました。", status: 500 };
	}
}

export async function deleteNotification(notificationId: string) {
	try {
		await db.delete(notifications).where(eq(notifications.id, notificationId));
		return { message: "通知の削除に成功しました。", status: 200 };
	} catch {
		return { message: "通知の削除に失敗しました。", status: 500 };
	}
}

export async function markNotificationAsRead(notificationId: string) {
	try {
		await db
			.update(notifications)
			.set({ isRead: true })
			.where(eq(notifications.id, notificationId));
		return { message: "通知の既読処理に成功しました。", status: 200 };
	} catch {
		return { message: "通知の既読処理に失敗しました。", status: 500 };
	}
}

export async function markAllNotificationsAsRead() {
	try {
		await db.update(notifications).set({ isRead: true });
		return { message: "通知の既読処理に成功しました。", status: 200 };
	} catch {
		return { message: "通知の既読処理に失敗しました。", status: 500 };
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
				return { message: "該当する課題が見つかりません。", status: 404 };
			}

			const courseIds = tasks.map((v) => v.courseId);

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

			// 通知データを生成
			const notificationsData = tasks.map((v) => ({
				title: `リマインダー: 課題（${v.title})`,
				description: v.description,
				sender: "system",
				receiver: v.courseId,
			}));

			// リマインダー通知をデータベースに保存
			await tx
				.insert(notifications)
				.values(notificationsData)
				.onConflictDoNothing();

			const emails = userEmailsByCourse.map((user) => user.email);

			// メール通知を有効にしているユーザーのリマインダー情報
			const reminders = tasks.map(({ courseId, ...rest }) => ({
				...rest,
			}));

			return { emails, reminders };
		});

		return result;
	} catch {
		return { message: "リマインダーの作成に失敗しました。", status: 500 };
	}
}
