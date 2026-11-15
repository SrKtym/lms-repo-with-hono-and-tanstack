import { client } from "../../lib/hono-client";

// 曜日と時限から講義を取得するqueryFn
export const fetchCoursesByWeekdayAndPeriodQueryFn = async (
	limit: number,
	offset: number,
	weekdays?: number,
	period?: number,
) => {
	if (!weekdays || !period) {
		return [];
	}

	const res = await client.api.courses.$get({
		query: {
			weekdays: weekdays.toString(),
			period: period.toString(),
			limit: limit.toString(),
			offset: offset.toString(),
		},
	});
	const data = await res.json();
	return data;
};

// 登録済み講義取得用のqueryFn
export const fetchRegisteredCoursesQueryFn = async () => {
	const res = await client.api.courses.registrations.$get();
	const data = await res.json();
	return data;
};

// 修了済み講義の総単位数取得用のqueryFn
export const fetchCompletedCreditsQueryFn = async () => {
	const res = await client.api.courses["completed-credits"].$get();
	const data = await res.json();
	return data;
};

// 作成済み講義取得用のqueryFn
export const fetchCreatedCoursesQueryFn = async () => {
	const res = await client.api.courses.creations.$get();
	const data = await res.json();
	return data;
};

// 講義を登録しているメンバー取得用のqueryFn
export const fetchMembersByCourseIdQueryFn = async (courseId: string) => {
	const res = await client.api.courses[":course-id"].members.$get({
		param: { "course-id": courseId },
	});
	const data = await res.json();
	return data;
};
