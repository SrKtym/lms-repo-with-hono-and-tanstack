import type { Assignments } from "@lms-repo/db/types";
import { client } from "@/lib/hono-client";

// 課題を作成するmutationFn
export const createAssignmentMutationFn = async (
	assignmentData: Assignments,
) => {
	const { courseId, ...rest } = assignmentData;
	const res = await client.api.professors.assignments[":course-id"].$post({
		param: { "course-id": courseId },
		json: rest,
	});
	const data = await res.json();
	return data;
};
