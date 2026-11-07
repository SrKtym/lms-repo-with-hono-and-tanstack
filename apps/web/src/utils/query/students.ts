import { client } from "../../lib/hono-client";

// 学生データ取得用のqueryFn
export const fetchStudentDataQueryFn = async () => {
	const res = await client.api.students.profile.$get();
	const data = await res.json();
	return data;
};
