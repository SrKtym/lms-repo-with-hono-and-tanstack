import type { Comments } from "@lms-repo/db/types";
import { client } from "@/lib/hono-client";

// コメントを作成するmutationFn
export const createCommentMutationFn = async (
	comment: Omit<Comments, "createdBy">,
) => {
	const res = await client.api.comments.$post({
		json: comment,
	});
	const data = await res.json();
	return data;
};
