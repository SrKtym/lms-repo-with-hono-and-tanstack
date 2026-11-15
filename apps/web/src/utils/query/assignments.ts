import { parseDates, parseDatesInArray } from "@lms-repo/ui/utils/datetime";
import { client } from "../../lib/hono-client";

// 課題一覧取得用のqueryFn
export const fetchAssignmentsQueryFn = async (courseId: string) => {
	const res = await client.api.courses[":course-id"].assignments.$get({
		param: {
			"course-id": courseId,
		},
	});

	if (!res.ok) {
		throw new Error("課題の取得に失敗しました");
	}

	const data = await res.json();
	return parseDatesInArray(data, ["dueDate"]);
};

// 単一課題取得用のqueryFn
export const fetchAssignmentQueryFn = async (
	courseId: string,
	assignmentId: string,
) => {
	const res = await client.api.courses[":course-id"].assignments[
		":assignment-id"
	].$get({
		param: {
			"course-id": courseId,
			"assignment-id": assignmentId,
		},
	});

	if (!res.ok) {
		throw new Error("課題の取得に失敗しました");
	}

	const data = await res.json();
	return parseDates(data, ["dueDate"]);
};
