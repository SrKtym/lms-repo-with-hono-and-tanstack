import { client } from "@/lib/hono-client";

// 教授データ登録のmutationFn
export const registerProfDataMutationFn = async (data: {
	departmentName: string;
}) => {
	const res = await client.api.professors.$post({
		json: data,
	});
	const result = await res.json();
	return result;
};
