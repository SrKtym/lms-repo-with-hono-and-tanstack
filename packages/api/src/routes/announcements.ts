import { Hono } from "hono";

// アナウンスメントに関するロジック
export const announcementsRoute = new Hono()
	.get("/", (c) => {
		return c.json({ message: "announcement list" }, 200);
	})
	.post("/", (c) => {
		return c.json({ message: "announcement created" }, 201);
	});
