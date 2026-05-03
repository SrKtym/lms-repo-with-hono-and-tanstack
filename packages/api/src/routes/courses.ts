import { zValidator } from "@hono/zod-validator";
import type { Session } from "@lms-repo/auth/server";
import type { Courses } from "@lms-repo/db/types";
import {
	createCourses,
	registerCourses,
	unregisterCourse,
} from "@lms-repo/db/utils/mutation/courses";
import {
	fetchCourses,
	fetchRegisteredCourses,
} from "@lms-repo/db/utils/query/courses";
import { Hono } from "hono";
import { z } from "zod";

// 講義に関するロジック
export const coursesRoute = new Hono<{
	Variables: {
		user: Session["user"];
		session: Session["session"];
	};
}>()
	.post("/", zValidator("form", z.custom<Courses>()), async (c) => {
		const courseData = c.req.valid("form");
		const result = await createCourses(courseData);
		return c.json(result);
	})
	.get(
		"/:weekdays/:period",
		zValidator("param", z.custom<Pick<Courses, "weekdays" | "period">>()),
		async (c) => {
			const { weekdays, period } = c.req.valid("param");
			const result = await fetchCourses(weekdays, period);
			return c.json(result, 200);
		},
	)
	.basePath("/registered")
	.post("/", zValidator("json", z.string()), async (c) => {
		const { userId } = c.get("session");
		const courseId = c.req.valid("json");
		const result = await registerCourses(courseId, userId);
		return c.json(result);
	})
	.get("/", async (c) => {
		const { userId } = c.get("session");
		const result = await fetchRegisteredCourses(userId);
		return c.json(result, 200);
	})
	.delete("/", zValidator("json", z.string()), async (c) => {
		const { userId } = c.get("session");
		const courseId = c.req.valid("json");
		const result = await unregisterCourse(courseId, userId);
		return c.json(result);
	});
