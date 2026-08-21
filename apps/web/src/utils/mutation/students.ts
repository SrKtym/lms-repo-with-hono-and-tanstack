import { client } from "@/lib/hono-client";

// 学生データ登録のmutationFn
export const registerStudentDataMutationFn = async (data: {
	grade: number;
	departmentName: string;
}) => {
	const res = await client.api.students.$post({
		json: data,
	});
	const result = await res.json();
	return result;
};
