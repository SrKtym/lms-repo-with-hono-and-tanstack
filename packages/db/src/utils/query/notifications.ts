import { and, desc, eq } from "drizzle-orm";
import { db } from "../../index";
import { notifications, userNotifications } from "../../schema";

// 通知の総数を取得
export async function fetchNotificationsCount(
	userId: string,
	filter?: "all" | "unread" | "read",
) {
	const conditions = [eq(userNotifications.userId, userId)];

	// フィルタオプションに基づいて既読/未読の条件を追加
	if (filter === "unread") {
		conditions.push(eq(userNotifications.isRead, false));
	} else if (filter === "read") {
		conditions.push(eq(userNotifications.isRead, true));
	}

	const count = await db
		.select({ count: notifications.id })
		.from(notifications)
		.innerJoin(
			userNotifications,
			eq(notifications.id, userNotifications.notificationId),
		)
		.where(and(...conditions));

	return count.length;
}

// 通知の取得（JOINでユーザーごとの通知管理状態を含める）
export async function fetchNotifications(
	userId: string,
	limit = 10,
	offset = 0,
) {
	const notificationList = await db
		.select({
			id: notifications.id,
			title: notifications.title,
			description: notifications.description,
			isRead: userNotifications.isRead,
			createdAt: notifications.createdAt,
		})
		.from(notifications)
		.innerJoin(
			userNotifications,
			eq(notifications.id, userNotifications.notificationId),
		)
		.where(eq(userNotifications.userId, userId))
		.orderBy(desc(notifications.createdAt))
		.limit(limit)
		.offset(offset);

	return notificationList;
}

export type FetchNotificationsReturnType = Awaited<
	ReturnType<typeof fetchNotifications>
>;

export type FetchEmailNotificationSettings = Awaited<
	ReturnType<typeof fetchNotificationsCount>
>;
