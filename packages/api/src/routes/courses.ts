import { zValidator } from "@hono/zod-validator";
import type { Session } from "@lms-repo/auth/server";
import type { Courses } from "@lms-repo/db/types";
import { createCourses } from "@lms-repo/db/utils/mutation/courses";
import {
	fetchCourses,
	fetchRegisteredCourses,
} from "@lms-repo/db/utils/query/courses";
import { Hono } from "hono";
import { z } from "zod";

// 講義に関するロジック
export const coursesRoute = new Hono<{
	Variables: {
		session: Session["session"];
		user: Session["user"];
	}
}>()
	.get(
		"/search",
		zValidator("query", z.custom<Pick<Courses, "weekdays" | "period">>()),
		async (c) => {
			const { weekdays, period } = c.req.valid("query");
			const result = await fetchCourses(weekdays, period);
			return c.json(result, 200);
		},
	)
	.get("/registered", async (c) => {
		const session = c.get("user");
		const userId = session.id;
		const result = await fetchRegisteredCourses(userId);
		return c.json(result, 200);
	})
	.post(
		"/single",
		zValidator("json", z.custom<Courses>()),
		async (c) => {			
			const courseData = c.req.valid("json");
			const result = await createCourses(courseData);
			return c.json(result);
		},
	)
	.post(
		"/multiple",
		zValidator("json", z.object({ name: z.string() })),
		async (c) => {
			const session = c.get("user");
			return c.json({ message: "course created", session }, 201);
		},
	);
