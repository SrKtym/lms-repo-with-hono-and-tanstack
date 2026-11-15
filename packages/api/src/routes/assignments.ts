import { zValidator } from "@hono/zod-validator";
import type { AuthVariables } from "@lms-repo/auth/server";
import { createAssignments } from "@lms-repo/db/utils/mutation/assignments";
import {
	fetchAssignmentByCourseAndId,
	fetchAssignmentsFromUserCourses,
} from "@lms-repo/db/utils/query/assignments";
import { resend } from "@lms-repo/emails";
import NewAssignmentEmail from "@lms-repo/emails/components/new-assignment-email";
import { env } from "@lms-repo/env/server";
import { DATETIME_FORMAT_CONFIG } from "@lms-repo/shared/utils";
import { Hono } from "hono";
import {
	requireAssignmentAccess,
	requireCourseAccess,
} from "../middleware/authorization";
import { formSchema } from "../schema/assignments";
import { commentsRoute } from "./comments";
import { submissionsRoute } from "./submissions";

// 課題に関するロジック
export const assignmentsRoute = new Hono<{ Variables: AuthVariables }>()
	.basePath("/:course-id/assignments")
	// 課題作成
	.post(
		"/",
		requireCourseAccess({ allow: ["professor", "admin"] }),
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
	)
	// 課題一覧取得
	.get("/", requireCourseAccess(), async (c) => {
		const { userId } = c.get("session");
		const { role } = c.get("user");
		const { "course-id": courseId } = c.req.param();
		const assignments = await fetchAssignmentsFromUserCourses(
			userId,
			courseId,
			{
				isAdmin: role === "admin",
			},
		);
		return c.json(assignments, 200);
	})
	// 特定の課題取得
	.get("/:assignment-id", requireAssignmentAccess(), async (c) => {
		const { "course-id": courseId, "assignment-id": assignmentId } =
			c.req.param();
		const assignment = await fetchAssignmentByCourseAndId(
			courseId,
			assignmentId,
		);

		return c.json(assignment, 200);
	})
	.route("/", commentsRoute)
	.route("/", submissionsRoute);
