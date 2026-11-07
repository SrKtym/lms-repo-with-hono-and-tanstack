import { client } from "../../lib/hono-client";

// 通知取得用のqueryFn
export const fetchNotificationsQueryFn = async (
	limit?: number,
	offset?: number,
) => {
	const queryParams: Record<string, string> = {};

	if (limit) {
		queryParams.limit = limit.toString();
	} else if (offset) {
		queryParams.offset = offset.toString();
	}

	const res = await client.api.students.notifications.$get({
		query: queryParams,
	});
	const data = await res.json();
	const parsedData = data.map((notification) => ({
		...notification,
		createdAt: new Date(notification.createdAt),
	}));
	return parsedData;
};

// 通知総数取得用のqueryFn
export const fetchNotificationsCountQueryFn = async (
	filter?: "all" | "unread" | "read",
) => {
	const queryParams: Record<string, string> = {};
	if (filter) {
		queryParams.filter = filter;
	}

	const res = await client.api.students.notifications.count.$get({
		query: queryParams,
	});
	const count = await res.json();
	return count;
};
