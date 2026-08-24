import { client } from "../../lib/hono-client";

// 曜日と時限から講義を取得するqueryFn
export const fetchCoursesByWeekdayAndPeriodQueryFn = async (
	weekdays?: number,
	period?: number,
	limit?: number,
	offset?: number,
) => {
	if (!weekdays || !period) {
		return [];
	}

	const queryParams: Record<string, string> = {};

	if (limit !== undefined) {
		queryParams.limit = limit.toString();
	}
	if (offset !== undefined) {
		queryParams.offset = offset.toString();
	}

	const res = await client.api.students.courses.$get({
		query: { weekdays, period, ...queryParams },
	});
	const data = await res.json();
	return data;
};

// 登録済み講義取得用のqueryFn
export const fetchRegisteredCoursesQueryFn = async () => {
	const res = await client.api.students.courses.registered.$get();
	const data = await res.json();
	return data;
};

// 修了済み講義の総単位数取得用のqueryFn
export const fetchCompletedCoursesQueryFn = async () => {
	const res = await client.api.students.courses.completed.$get();
	const data = await res.json();
	return data;
};

// 作成済み講義取得用のqueryFn
export const fetchCreatedCoursesQueryFn = async () => {
	const res = await client.api.professors.courses.created.$get();
	const data = await res.json();
	return data;
};

// 講義を登録しているメンバー取得用のqueryFn
export const fetchMembersByCourseIdQueryFn = async (courseId: string) => {
	const res = await client.api.courses[":courseId"].$get({
		param: { courseId },
	});
	const data = await res.json();
	return data;
};
