import { Hono } from "hono";

// 通知に関するロジック
export const notificationsRoute = new Hono()
	.get("/", (c) => {
		return c.json({ message: "notification list" }, 200);
	})
	.post("/", (c) => {
		return c.json({ message: "notification created" }, 201);
	});
