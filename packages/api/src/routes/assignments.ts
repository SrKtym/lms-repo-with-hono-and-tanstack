import { zValidator } from "@hono/zod-validator";
import type { Session } from "@lms-repo/auth/server";
import { createAssignments } from "@lms-repo/db/utils/mutation/assignments";
import { fetchAssignmentsFromUserCourses } from "@lms-repo/db/utils/query/assignments";
import { resend } from "@lms-repo/emails";
import NewAssignmentEmail from "@lms-repo/emails/components/new-assignment-email";
import { env } from "@lms-repo/env/server";
import { DATETIME_FORMAT_CONFIG } from "@lms-repo/shared/utils";
import { Hono } from "hono";
import { formSchema } from "../schema/assignments";

// 課題に関するロジック（教員用）
export const assignmentsRouteForProf = new Hono<{
	Variables: {
		user: Session["user"];
		session: Session["session"];
	};
}>()
	// 課題作成
	.post(
		"/:course-id",
		zValidator("json", formSchema, (result, c) => {
			if (!result.success) {
				const firstError = result.error.issues[0]?.message;
				return c.json({ error: firstError }, 400);
			}
		}),
		async (c) => {
			const { "course-id": courseId } = c.req.param();
			const assignmentData = c.req.valid("json");
			const result = await createAssignments({ ...assignmentData, courseId });

			if ("error" in result) {
				const { status, ...body } = result;
				return c.json(body, status);
			}
			if ("warning" in result) {
				const { status, ...body } = result;
				return c.json(body, status);
			}

			const { emails, title, description, dueDate } = result;

			const viewUrl = `${env.CORS_ORIGIN}/notifications`;

			// バッチでメールを送信（全員に同じ内容）
			const batchEmails = emails.map((email) => ({
				from: `LMS-repo <${env.EMAIL_ADDRESS}>`,
				to: email,
				subject: "新しい課題",
				react: NewAssignmentEmail({
					assignmentTitle: title,
					assignmentDescription: description,
					dueDate: dueDate.toLocaleDateString(
						DATETIME_FORMAT_CONFIG.DEFAULT.defaultLocale,
						DATETIME_FORMAT_CONFIG.DEFAULT.options,
					),
					viewUrl,
				}),
			}));

			await resend.batch.send(batchEmails);

			return c.json({ message: "課題を作成しました" }, 201);
		},
	);

// 課題に関するロジック（共通）
export const assignmentsRouteForCommon = new Hono<{
	Variables: {
		user: Session["user"];
		session: Session["session"];
	};
}>()
	// 課題一覧取得
	.get("/:course-id?", async (c) => {
		const { userId } = c.get("session");
		const { "course-id": courseId } = c.req.param();
		const assignments = await fetchAssignmentsFromUserCourses(userId, courseId);
		return c.json(assignments, 200);
	});
