import { useMutation, useQuery } from "@tanstack/react-query";
import { QUERY_CONFIG, queryClient } from "@/lib/query-client";
import { registerStudentDataMutationFn } from "@/utils/mutation/students";
import { fetchMembersByCourseIdQueryFn } from "@/utils/query/courses";

// 講義を登録しているメンバーの取得
export const useMembersByCourseId = (courseId: string) => {
	return useQuery({
		queryKey: ["members-by-course-id", courseId],
		queryFn: () => fetchMembersByCourseIdQueryFn(courseId),
		...QUERY_CONFIG.USER_DATA,
	});
};

// 学生データ登録のミューテーション
export const useRegisterStudentData = () => {
	return useMutation({
		mutationFn: registerStudentDataMutationFn,
		onSettled: () => {
			// ミューテーションの成功時も失敗時も再フェッチする
			queryClient.invalidateQueries({ queryKey: ["studentData"] });
		},
	});
};
