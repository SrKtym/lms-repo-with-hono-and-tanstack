import type { Session } from "@lms-repo/auth/server";
import { Hono } from "hono";

// スケジュールに関するロジック
export const schedulesRoute = new Hono<{
	Variables: {
		user: Session["user"] | null;
		session: Session["session"] | null;
	};
}>()
	.get("/", (c) => {
		const session = c.get("user");
		if (!session) return c.json({ message: "not authenticated" }, 401);
		return c.json({ message: "schedule list" }, 200);
	})
	.post("/", (c) => {
		const session = c.get("user");
		if (!session) return c.json({ message: "not authenticated" }, 401);
		return c.json({ message: "schedule created" }, 201);
	});
