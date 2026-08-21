import { client } from "../../lib/hono-client";

// 課題取得用のqueryFn
export const fetchAssignmentsQueryFn = async () => {
	const res = await client.api.assignments.$get();
	const data = await res.json();
	const parsedData = data.map((assignment) => ({
		...assignment,
		dueDate: new Date(assignment.dueDate),
	}));
	return parsedData;
};
