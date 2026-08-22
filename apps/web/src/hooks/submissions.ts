import type {
	FetchFileMetadataByUserIdReturnType,
	FetchTextSubmissionsByUserIdReturnType,
} from "@lms-repo/db/utils/query/submissions";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import {
	createTextSubmissionMutationFn,
	deleteFileMutationFn,
	deleteTextSubmissionMutationFn,
	gradeSubmissionMutationFn,
	submitMultipleFilesMutationFn,
} from "@/utils/mutation/submissions";
import {
	fetchAllSubmissionsWithStudentsQueryFn,
	fetchDownloadUrlQueryFn,
	fetchFileMetadataQueryFn,
	fetchTextSubmissionsQueryFn,
} from "@/utils/query/submissions";

// 指定された課題のすべての提出状況を取得するフック（教員用、無限スクロール対応）
export const useAllSubmissionsWithStudents = (assignmentId: string) => {
	return useInfiniteQuery({
		queryKey: ["all-submissions-with-students", assignmentId],
		queryFn: async ({ pageParam = 0 }) => {
			const data = await fetchAllSubmissionsWithStudentsQueryFn(
				assignmentId,
				10,
				pageParam * 10,
			);

			if ("error" in data) {
				return [];
			}
			return data;
		},
		initialPageParam: 0,
		getNextPageParam: (lastPage, allPages) => {
			if (lastPage.length < 10) {
				return;
			}
			return allPages.length;
		},
	});
};

// テキスト提出取得のフック
export const useTextSubmissions = (assignmentId?: string) => {
	return useQuery({
		queryKey: ["text-submissions", assignmentId],
		queryFn: () => fetchTextSubmissionsQueryFn(assignmentId),
	});
};

// ファイルメタデータ取得のフック
export const useFileMetadata = (assignmentId?: string) => {
	return useQuery({
		queryKey: ["file-metadata", assignmentId],
		queryFn: () => fetchFileMetadataQueryFn(assignmentId),
	});
};

// ダウンロードURL取得のフック
export const useDownloadUrl = (fileId: string) => {
	return useQuery({
		queryKey: ["download-url", fileId],
		queryFn: () => fetchDownloadUrlQueryFn(fileId),
		enabled: !!fileId,
	});
};

// ファイル削除のフック
export const useDeleteFile = () => {
	return useMutation({
		mutationFn: deleteFileMutationFn,
		onMutate: async (fileId) => {
			// 古いデータの再取得をキャンセルする
			await queryClient.cancelQueries({ queryKey: ["file-metadata"] });

			// 更新前のデータを保存し、エラー発生時のロールバック用に使用
			const previousMetadata = queryClient.getQueryData(["file-metadata"]);

			// 楽観的更新
			queryClient.setQueryData(
				["file-metadata"],
				(old?: FetchFileMetadataByUserIdReturnType) =>
					old?.filter((file) => file.id !== fileId) ?? [],
			);

			return { previousMetadata };
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["file-metadata"] });
		},
	});
};

// テキスト提出のフック
export const useCreateTextSubmission = () => {
	return useMutation({
		mutationFn: createTextSubmissionMutationFn,
		onMutate: async (submissionData) => {
			// 古いデータの再取得をキャンセルする
			await queryClient.cancelQueries({ queryKey: ["text-submissions"] });

			// 更新前のデータを保存し、エラー発生時のロールバック用に使用
			const previousSubmissions = queryClient.getQueryData([
				"text-submissions",
			]);

			// 楽観的更新
			queryClient.setQueryData(
				["text-submissions"],
				(old?: FetchTextSubmissionsByUserIdReturnType) => [
					...(old ?? []),
					submissionData,
				],
			);

			return { previousSubmissions };
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["text-submissions"] });
		},
	});
};

// テキスト提出物削除のフック
export const useDeleteTextSubmission = () => {
	return useMutation({
		mutationFn: deleteTextSubmissionMutationFn,
		onMutate: async (submissionId) => {
			// 古いデータの再取得をキャンセルする
			await queryClient.cancelQueries({ queryKey: ["text-submissions"] });

			// 更新前のデータを保存し、エラー発生時のロールバック用に使用
			const previousSubmissions = queryClient.getQueryData([
				"text-submissions",
			]);

			// 楽観的更新
			queryClient.setQueryData(
				["text-submissions"],
				(old?: FetchTextSubmissionsByUserIdReturnType) =>
					old?.filter((submission) => submission.id !== submissionId) ?? [],
			);

			return { previousSubmissions };
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["text-submissions"] });
		},
	});
};

// 複数ファイルアップロードのフック（n+1問題を回避）
export const useSubmitMultipleFiles = () => {
	return useMutation({
		mutationFn: submitMultipleFilesMutationFn,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["file-submissions"] });
		},
	});
};

// 採点のフック（教員用）
export const useGradeSubmission = () => {
	return useMutation({
		mutationFn: gradeSubmissionMutationFn,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["all-submissions-with-students"],
			});
		},
	});
};
