import type { Session } from "@lms-repo/auth/server";
import { deleteNotification, markAllNotificationsAsRead, markNotificationAsRead } from "@lms-repo/db/utils/mutation/notifications";
import { fetchNotifications } from "@lms-repo/db/utils/query/notifications";
import { Hono } from "hono";

// 通知に関するロジック
export const notificationsRoute = new Hono<{
	Variables: {
		user: Session["user"];
		session: Session["session"];
	};
}>()
	.post("/", (c) => {
		return c.json({ message: "notification created" }, 201);
	})
	.get("/", async (c) => {
		const { userId } = c.get("session");
		const notificationList = await fetchNotifications(userId);
		return c.json(notificationList, 200);
	})
	.patch("/:id/mark_as_read", async (c) => {
		const { id } = c.req.param();
		const result = await markNotificationAsRead(id);
		return c.json(result);
	})
	.patch("/mark_all_as_read", async (c) => {
		const result = await markAllNotificationsAsRead();
		return c.json(result);
	})
	.delete("/:id", async (c) => {
		const { id } = c.req.param();
		const result = await deleteNotification(id);
		return c.json(result);
	});
