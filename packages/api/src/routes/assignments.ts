import { zValidator } from "@hono/zod-validator";
import type { Session } from "@lms-repo/auth/server";
import {
	fetchAssignmentById,
	fetchAssignmentsFromUserCourses,
} from "@lms-repo/db/utils/query/assignments";
import { createAssignments } from "@lms-repo/db/utils/mutation/assignments";
import { Hono } from "hono";
import { z } from "zod";

const formSchema = z.object({
	title: z.string().min(1, "課題名は必須です"),
	description: z.string(),
	points: z
		.number()
		.int("点数は整数で入力してください")
		.min(0, "点数は0以上で入力してください")
		.max(100, "点数は100以下で入力してください"),
	dueDate: z.coerce
		.date()
		.min(new Date(), "締切日は未来の日付を入力してください"),
	format: z.string().min(1, "提出形式を選択してください."),
	courseId: z.string().min(1),
});

// 課題に関するロジック
export const assignmentsRoute = new Hono<{
	Variables: {
		user: Session["user"];
		session: Session["session"];
	};
}>()
	// 課題作成
	.post("/", zValidator("json", formSchema), async (c) => {
		const assignmentData = c.req.valid("json");
		const result = await createAssignments(assignmentData);
		return c.json(result, 201);
	})
	// 課題一覧取得
	.get("/", async (c) => {
		const { userId } = c.get("session");
		const assignments = await fetchAssignmentsFromUserCourses(userId);
		return c.json(assignments, 200);
	})
	// 課題個別取得
	.get("/:id", zValidator("param", z.string()), async (c) => {
		const assignmentId = c.req.valid("param");
		const assignment = await fetchAssignmentById(assignmentId);
		return c.json(assignment, 200);
	});
