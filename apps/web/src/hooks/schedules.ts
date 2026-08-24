import type { Schedules } from "@lms-repo/db/types";
import type { FetchSchedulesReturnType } from "@lms-repo/db/utils/query/schedules";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import {
	createScheduleMutationFn,
	deleteScheduleMutationFn,
} from "@/utils/mutation/schedules";
import { fetchSchedulesQueryFn } from "@/utils/query/schedules";

// スケジュールを取得するカスタムフック
export const useSchedules = (initialData?: FetchSchedulesReturnType) => {
	return useQuery({
		queryKey: ["schedules"],
		queryFn: fetchSchedulesQueryFn,
		initialData,
	});
};

// スケジュールを作成するカスタムフック
export const useCreateSchedule = () => {
	return useMutation({
		mutationFn: createScheduleMutationFn,
		onMutate: async (scheduleData) => {
			// 古いデータの再取得をキャンセルする
			await queryClient.cancelQueries({ queryKey: ["schedules"] });

			// 更新前のデータを保存し、エラー発生時のロールバック用に使用
			const previousSchedules = queryClient.getQueryData(["schedules"]);

			// 楽観的更新
			queryClient.setQueryData(["schedules"], (old: Schedules[]) => [
				...old,
				{ ...scheduleData, id: "temp-id" },
			]);

			return { previousSchedules };
		},
		onError: (_err, _scheduleData, context) => {
			// ミューテーションが失敗した場合, ロールバック用データをコンテキストから受け取る
			if (context?.previousSchedules) {
				queryClient.setQueryData(["schedules"], context.previousSchedules);
			}
		},
		onSettled: () => {
			// ミューテーションの成功時も失敗時も再フェッチする
			queryClient.invalidateQueries({ queryKey: ["schedules"] });
		},
	});
};

// スケジュールを削除するカスタムフック
export const useDeleteSchedule = () => {
	return useMutation({
		mutationFn: deleteScheduleMutationFn,
		onMutate: async (scheduleId) => {
			// 古いデータの再取得をキャンセルする
			await queryClient.cancelQueries({ queryKey: ["schedules"] });

			// 更新前のデータを保存し、エラー発生時のロールバック用に使用
			const previousSchedules = queryClient.getQueryData(["schedules"]);

			// 楽観的更新
			queryClient.setQueryData(["schedules"], (old: Schedules[]) =>
				old.filter((schedule) => schedule.id !== scheduleId),
			);

			return { previousSchedules };
		},
		onError: (_err, _scheduleId, context) => {
			// ミューテーションが失敗した場合, ロールバック用データをコンテキストから受け取る
			if (context?.previousSchedules) {
				queryClient.setQueryData(["schedules"], context.previousSchedules);
			}
		},
		onSettled: () => {
			// ミューテーションの成功時も失敗時も再フェッチする
			queryClient.invalidateQueries({ queryKey: ["schedules"] });
		},
	});
};
