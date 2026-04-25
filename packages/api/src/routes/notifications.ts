import type { Session } from "@lms-repo/auth/server";
import { Hono } from "hono";

// 通知に関するロジック
export const notificationsRoute = new Hono<{
	Variables: {
		user: Session["user"];
		session: Session["session"];
	};
}>()
	.get("/", (c) => {
		return c.json({ message: "notification list" }, 200);
	})
	.post("/", (c) => {
		return c.json({ message: "notification created" }, 201);
	});
