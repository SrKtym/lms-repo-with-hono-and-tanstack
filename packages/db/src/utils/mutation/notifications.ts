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

// リマインダーの作成
export async function createReminder(userId: string) {
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
				.innerJoin(registration, eq(courses.id, registration.courseId))
				.where(
					and(
						eq(registration.userId, userId),
						lte(assignments.dueDate, target),
						gt(assignments.dueDate, now),
					),
				);

			if (tasks.length === 0) {
				return { message: "該当する課題が見つかりません。", status: 404 };
			}

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

			const courseIds = tasks.map((v) => v.courseId);

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
						inArray(registration.courseId, courseIds),
						eq(emailNotificationSettings.remindersEmail, true),
					),
				);

			// メール通知を有効にしているユーザーのメールアドレスを抽出
			const emails = res.map(({ email }) => email);

			// 課題の詳細とメールアドレスをマージ
			const marged = tasks.map(({ title, description, dueDate }) => ({
				title,
				description,
				dueDate,
				email: emails,
			}));

			return marged;
		});

		return result;
	} catch {
		return { message: "リマインダーの作成に失敗しました。", status: 500 };
	}
}
