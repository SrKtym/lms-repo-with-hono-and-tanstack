import { zValidator } from "@hono/zod-validator";
import type { AuthVariables } from "@lms-repo/auth/server";
import { createComments } from "@lms-repo/db/utils/mutation/comments";
import { fetchCommentsWithAssignment } from "@lms-repo/db/utils/query/comments";
import { Hono } from "hono";
import { requireAssignmentAccess } from "../middleware/authorization";
import { formSchema } from "../schema/comments";

export const commentsRoute = new Hono<{ Variables: AuthVariables }>()
	.basePath("/:assignment-id/comments")
	// コメント作成
	.post(
		"/",
		requireAssignmentAccess(),
		zValidator("json", formSchema, (result, c) => {
			if (!result.success) {
				const firstError = result.error.issues[0]?.message;
				return c.json({ error: firstError }, 400);
			}
		}),
		async (c) => {
			const { userId } = c.get("session");
			const { "assignment-id": assignmentId } = c.req.param();
			const comment = c.req.valid("json");

			const { status, ...body } = await createComments({
				...comment,
				assignmentId,
				createdBy: userId,
			});
			return c.json(body, status);
		},
	)
	// コメント取得
	.get("/", requireAssignmentAccess(), async (c) => {
		const { "assignment-id": assignmentId } = c.req.param();
		const result = await fetchCommentsWithAssignment(assignmentId);
		return c.json(result, 200);
	});
