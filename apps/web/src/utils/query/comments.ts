import { client } from "../../lib/hono-client";

// コメント取得用のqueryFn
export const fetchCommentsWithAssignmentQueryFn = async (
	assignmentId: string,
) => {
	const res = await client.api.comments[":assignmentId"].$get({
		param: { assignmentId },
	});
	const data = await res.json();
	const parsedData = data.map((comment) => ({
		...comment,
		createdAt: new Date(comment.createdAt),
		updatedAt: new Date(comment.updatedAt),
	}));
	return parsedData;
};
