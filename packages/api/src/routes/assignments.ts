import { Hono } from "hono";

// 課題に関するロジック
export const assignmentsRoute = new Hono()
	.get("/", (c) => {
		return c.json({ message: "assignment list" }, 200);
	})
	.post("/", (c) => {
		return c.json({ message: "assignment created" }, 201);
	});
