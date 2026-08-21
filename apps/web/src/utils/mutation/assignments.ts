import type { Assignments } from "@lms-repo/db/types";
import { client } from "@/lib/hono-client";

// 課題を作成するmutationFn
export const createAssignmentMutationFn = async (
	assignmentData: Assignments,
) => {
	const res = await client.api.professors.assignments.$post({
		json: assignmentData,
	});
	const data = await res.json();
	return data;
};
