import { Hono } from "hono";

// スケジュールに関するロジック
export const schedulesRoute = new Hono()
	.get("/", (c) => {
		return c.json({ message: "schedule list" }, 200);
	})
	.post("/", (c) => {
		return c.json({ message: "schedule created" }, 201);
	});
