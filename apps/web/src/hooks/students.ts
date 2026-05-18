import { useMutation } from "@tanstack/react-query";
import { client } from "@/lib/hono-client";
import { queryClient } from "@/lib/query-client";

// 学生データ登録のミューテーション
export const useRegisterStudentData = () => {
	return useMutation({
		mutationFn: async (data: { grade: number; departmentName: string }) => {
			const res = await client.api.students.$post({
				json: data,
			});
			const result = await res.json();
			return result;
		},
		onSettled: () => {
			// Always refetch after error or success
			queryClient.invalidateQueries({ queryKey: ["students"] });
		},
	});
};
