import { eq } from "drizzle-orm";
import { db } from "../../index";
import { notifications } from "../../schema";
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

