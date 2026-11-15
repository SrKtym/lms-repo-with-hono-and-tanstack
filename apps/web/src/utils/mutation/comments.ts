import type { formSchema } from "@lms-repo/api/schema/comments";
import type { z } from "zod";
import { client } from "@/lib/hono-client";

type CommentDataWithIds = z.infer<typeof formSchema> & {
	assignmentId: string;
	courseId: string;
};

// コメントを作成するmutationFn
export const createCommentMutationFn = async (data: CommentDataWithIds) => {
	const { courseId, ...comment } = data;
	const res = await client.api.courses[":course-id"].assignments[
		":assignment-id"
	].comments.$post({
		param: { "course-id": courseId, "assignment-id": comment.assignmentId },
		json: comment,
	});
	const result = await res.json();
	return result;
};
