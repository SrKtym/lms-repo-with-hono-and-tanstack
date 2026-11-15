import { parseDatesInArray } from "@lms-repo/ui/utils/datetime";
import { client } from "../../lib/hono-client";

// コメント取得用のqueryFn
export const fetchCommentsWithAssignmentQueryFn = async (
	courseId: string,
	assignmentId: string,
) => {
	const res = await client.api.courses[":course-id"].assignments[
		":assignment-id"
	].comments.$get({
		param: { "course-id": courseId, "assignment-id": assignmentId },
	});
	const data = await res.json();
	return parseDatesInArray(data, ["createdAt", "updatedAt"]);
};
