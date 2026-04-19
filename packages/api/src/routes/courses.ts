import { zValidator } from "@hono/zod-validator";
import { fetchCourses, fetchRegisteredCourses } from "@lms-repo/db/utils/query/courses";
import type { Courses } from "@lms-repo/db/types";
import { Hono } from "hono";
import { z } from "zod";
import { createCourses } from "@lms-repo/db/utils/mutation/courses";
import type { Session } from "@lms-repo/auth/server";

// 講義に関するロジック
export const coursesRoute = new Hono<{
	Variables: {
		user: Session["user"] | null;
		session: Session["session"] | null;
	};
}>()
	.get("/search", 
		zValidator("json", z.custom<Pick<Courses, "weekdays" | "period">>()),
		async (c) => {
			const { weekdays, period } = c.req.valid("json");
			const result = await fetchCourses(weekdays, period);
			return c.json(result, 200);
		})
	.get("/registered", async (c) => {
		const session = c.get("user");
		if (!session) return c.json({ message: "not authenticated" }, 401);

		const userId = session.id;
		const result = await fetchRegisteredCourses(userId);
		return c.json(result, 200);
	})
	.post("/single", 
		zValidator("form", z.custom<Courses>()),
		async (c) => {
			const courseData = c.req.valid("form");
			const result = await createCourses(courseData);
			return c.json(result);
		})
	.post(
		"/multiple",
		zValidator("json", z.object({ name: z.string() })),
		async (c) => {
			const session = c.get("session");
			return c.json({ message: "course created", session }, 201);
		},
	);
