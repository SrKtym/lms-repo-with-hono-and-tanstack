import { zValidator } from "@hono/zod-validator";
import type { Session } from "@lms-repo/auth/server";
import type { Courses } from "@lms-repo/db/types";
import { createCourses, deleteCourse } from "@lms-repo/db/utils/mutation/courses";
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
		"/",
		zValidator("query", z.custom<Pick<Courses, "weekdays" | "period">>()),
		async (c) => {
			const { weekdays, period } = c.req.valid("query");
			const result = await fetchCourses(weekdays, period);
			return c.json(result, 200);
		},
	)
	.get("/registered", async (c) => {
		const { id } = c.get("user");
		const result = await fetchRegisteredCourses(id);
		return c.json(result, 200);
	})
	.post(
		"/single",
		zValidator("form", z.custom<Courses>()),
		async (c) => {			
			const courseData = c.req.valid("form");
			const result = await createCourses(courseData);
			return c.json(result);
		},
	)
	.post(
		"/multiple",
		zValidator("json", z.object({ name: z.string() })),
		async (c) => {
			const { id } = c.get("user");
			return c.json({ message: "course created", userId: id }, 201);
		},
	)
	.delete(
		"/:courseId",
		zValidator("param", z.object({ courseId: z.string() })),
		async (c) => {
			const { id } = c.get("user");
			const { courseId } = c.req.valid("param");
			const result = await deleteCourse(courseId, id);
			return c.json(result);
		},
	);
