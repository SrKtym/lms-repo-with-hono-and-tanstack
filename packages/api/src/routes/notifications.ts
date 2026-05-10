import type { Session } from "@lms-repo/auth/server";
import {
	deleteNotification,
	markAllNotificationsAsRead,
	markNotificationAsRead,
} from "@lms-repo/db/utils/mutation/notifications";
import { fetchNotifications } from "@lms-repo/db/utils/query/notifications";
import { Hono } from "hono";

// 通知に関するロジック
export const notificationsRoute = new Hono<{
	Variables: {
		user: Session["user"];
		session: Session["session"];
	};
}>()
	// 通知作成
	.post("/", (c) => {
		return c.json({ message: "notification created" }, 201);
	})
	// 通知取得
	.get("/", async (c) => {
		const { userId } = c.get("session");
		const notificationList = await fetchNotifications(userId);
		return c.json(notificationList, 200);
	})
	// 通知既読
	.patch("/:id/mark_as_read", async (c) => {
		const id = c.req.param("id");
		const result = await markNotificationAsRead(id);
		return c.json(result);
	})
	// すべての通知を既読
	.patch("/mark_all_as_read", async (c) => {
		const result = await markAllNotificationsAsRead();
		return c.json(result);
	})
	// 通知削除
	.delete("/:id", async (c) => {
		const id = c.req.param("id");
		const result = await deleteNotification(id);
		return c.json(result);
	});
