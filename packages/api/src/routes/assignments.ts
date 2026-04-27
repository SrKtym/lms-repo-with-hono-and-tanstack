import { zValidator } from "@hono/zod-validator";
import type { Session } from "@lms-repo/auth/server";
import {
	fetchAssignmentById,
	fetchAssignments,
	fetchAllAssignments,
} from "@lms-repo/db/utils/query/assignments";
import { Hono } from "hono";
import { z } from "zod";

// 課題に関するロジック
export const assignmentsRoute = new Hono<{
	Variables: {
		user: Session["user"];
		session: Session["session"];
	};
}>()
	.get(
		"/select",
		zValidator(
			"query",
			z.object({
				courseId: z.string().optional(),
			}),
		),
		async (c) => {
			const { courseId } = c.req.valid("query");
			const assignments = await fetchAssignments(courseId);
			return c.json(assignments, 200);
		},
	)
	.get(
		"/select/all",
		async (c) => {
			const { userId } = c.get("session");
			const assignments = await fetchAllAssignments(userId);
			return c.json(assignments, 200);
		},
	)
	.get(
		"/select/:assignmentId",
		zValidator(
			"param",
			z.object({
				assignmentId: z.string(),
			}),
		),
		async (c) => {
			const { assignmentId } = c.req.valid("param");
			const assignment = await fetchAssignmentById(assignmentId);
			return c.json(assignment, 200);
		},
	)
	.post("/create", async (c) => {
		return c.json({ message: "assignment created" }, 201);
	});
