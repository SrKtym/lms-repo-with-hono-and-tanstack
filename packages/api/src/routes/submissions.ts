import type { Session } from "@lms-repo/auth/server";
import {
	fetchSubmissionById,
	fetchSubmissionsFromUserCourses,
} from "@lms-repo/db/utils/query/submissions";
import { Hono } from "hono";

export const submissionsRoute = new Hono<{
	Variables: {
		user: Session["user"];
		session: Session["session"];
	};
}>()
	// 課題提出状況の取得
	.get("/", async (c) => {
		const { userId } = c.get("session");
		const submissions = await fetchSubmissionsFromUserCourses(userId);
		return c.json(submissions, 200);
	})
	// 特定の課題提出状況の取得
	.get("/:assignmentId", async (c) => {
		const { userId } = c.get("session");
		const assignmentId = c.req.param("assignmentId");
		const submission = await fetchSubmissionById(userId, assignmentId);
		return c.json(submission, 200);
	});
