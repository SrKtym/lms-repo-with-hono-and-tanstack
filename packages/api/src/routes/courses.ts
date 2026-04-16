import { zValidator } from "@hono/zod-validator";
import { fetchSession } from "@lms-repo/auth/utils/fetch-session";
import { Hono } from "hono";
import { z } from "zod";

// 講義に関するロジック
export const coursesRoute = new Hono()
	.get("/", (c) => {
		return c.json({ message: "course list" }, 200);
	})
	.get("/registered", (c) => {
		return c.json({ message: "registered courses" }, 200);
	})
	.post("/single", (c) => {
		return c.json({ message: "course created" }, 201);
	})
	.post(
		"/multiple",
		zValidator("json", z.object({ name: z.string() })),
		async (c) => {
			const session = await fetchSession(c);
			return c.json({ message: "course created", session }, 201);
		},
	);
