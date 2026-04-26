import { client } from "../lib/hono-client";

// 登録済みコース取得用のqueryFn
export const fetchRegisteredCoursesQueryFn = async () => {
	const res = await client.api.courses.search.registered.$get();
	const data = await res.json();
	if ("message" in data) {
		return [];
	}
	return data;
};

// スケジュール取得用のqueryFn
export const fetchSchedulesQueryFn = async () => {
	const res = await client.api.schedules.select.$get();
	const data = await res.json();
	const parsedData = data.map((schedule) => ({
		...schedule,
		startTime: new Date(schedule.startTime),
		endTime: new Date(schedule.endTime),
	}));
	return parsedData;
};

// お知らせ取得用のqueryFn
export const fetchAnnouncementsQueryFn = async () => {
	const res = await client.api.announcements.select.relatedCourses.$get();
	const data = await res.json();
	const parsedData = data.map((announcement) => ({
		...announcement,
		createdAt: new Date(announcement.createdAt),
		updatedAt: new Date(announcement.updatedAt),
	}));
	return parsedData;
};

// 課題取得用のqueryFn
export const fetchAssignmentsQueryFn = async (courseId?: string) => {
	const query = courseId ? { courseId } : {};
	const res = await client.api.assignments.select.$get({ query });
	const data = await res.json();
	const parsedData = data.map((assignment) => ({
		...assignment,
		dueDate: new Date(assignment.dueDate),
	}));
	return parsedData;
};
