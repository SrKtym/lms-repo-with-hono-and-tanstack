import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { registerProfDataMutationFn } from "@/utils/mutation/professors";

// 教授データ登録のミューテーション
export const useRegisterProfData = () => {
	return useMutation({
		mutationFn: registerProfDataMutationFn,
		onSettled: () => {
			// ミューテーションの成功時も失敗時も再フェッチする
			queryClient.invalidateQueries({ queryKey: ["professors"] });
		},
	});
};
