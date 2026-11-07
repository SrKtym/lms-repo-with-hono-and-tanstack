import { client } from "../../lib/hono-client";

// 教授データ取得用のqueryFn
export const fetchProfDataQueryFn = async () => {
	const res = await client.api.professors.profile.$get();
	const data = await res.json();
	return data;
};
