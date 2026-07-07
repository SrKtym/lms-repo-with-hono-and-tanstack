import { useMutation, useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono-client";
import { queryClient } from "@/lib/query-client";
import {
	fetchDownloadUrlQueryFn,
	fetchFileMetadataQueryFn,
} from "@/utils/query-utils";

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
		mutationFn: async (fileId: string) => {
			const res = await client.api.submissions.files[":id"].$delete({
				param: { id: fileId },
			});
			const result = await res.json();
			if (!res.ok) {
				const errorMessage =
					"error" in result
						? result.error
						: "message" in result
							? result.message
							: "ファイルの削除に失敗しました";
				throw new Error(errorMessage);
			}
			return result;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["file-metadata"] });
		},
	});
};

// テキスト提出のフック
export const useCreateTextSubmission = () => {
	return useMutation({
		mutationFn: async (submissionData: {
			title: string;
			description: string;
			assignmentId: string;
		}) => {
			const res = await client.api.submissions.text.$post({
				json: submissionData,
			});
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["text-submissions"] });
		},
	});
};

// 複数ファイルアップロードのフック（n+1問題を回避）
export const useSubmitMultipleFiles = () => {
	return useMutation({
		mutationFn: async ({
			files,
			assignmentId,
		}: {
			files: File[];
			assignmentId: string;
		}) => {
			// エミュレータ環境かどうかを判定（環境変数などで判断）
			// 開発環境では直接アップロードエンドポイントを使用
			const isEmulator = import.meta.env.DEV;

			if (isEmulator) {
				// エミュレータ環境：直接アップロードエンドポイントを使用
				const uploadPromises = files.map(async (file) => {
					const formData = new FormData();
					formData.append("file", file);
					formData.append("fileName", file.name);

					const uploadRes = await fetch(
						"http://localhost:3000/api/submissions/upload",
						{
							method: "POST",
							body: formData,
							credentials: "include",
						},
					);

					if (!uploadRes.ok) {
						throw new Error(`${file.name}のアップロードに失敗しました`);
					}

					return uploadRes.json();
				});

				const uploadedMetadata = await Promise.all(uploadPromises);

				// メタデータを一括保存
				const metadataRes = await client.api.submissions.metadata.$post({
					json: {
						metadataList: uploadedMetadata,
						assignmentId,
					},
				});

				return metadataRes.json();
			}
			// 本番環境：署名付きURLを使用
			// 1. 署名付きURLを一括取得（1回のAPIリクエスト）
			const signedUrlsRes = await client.api.submissions.signed_urls.$post({
				json: files.map((file) => ({
					fileName: file.name,
					fileType: file.type,
					fileSize: file.size,
				})),
			});
			const signedUrls = await signedUrlsRes.json();

			if ("error" in signedUrls) {
				throw new Error(signedUrls.error);
			}

			// 2. Cloud Storageにファイルを並列アップロード
			const uploadPromises = signedUrls.map(
				async ({ fileName, signedUrl, objectName }) => {
					const file = files.find((f) => f.name === fileName);
					if (!file) throw new Error(`ファイル ${fileName} が見つかりません`);

					const uploadRes = await fetch(signedUrl, {
						method: "PUT",
						body: file,
						headers: {
							"Content-Type": file.type,
						},
					});

					if (!uploadRes.ok) {
						throw new Error(`${file.name}のアップロードに失敗しました`);
					}

					return {
						objectName,
						originalName: file.name,
						mimeType: file.type,
						fileSize: file.size,
					};
				},
			);

			const uploadedMetadata = await Promise.all(uploadPromises);

			// 3. メタデータを一括保存（1回のAPIリクエスト）
			const metadataRes = await client.api.submissions.metadata.$post({
				json: {
					metadataList: uploadedMetadata,
					assignmentId,
				},
			});

			return metadataRes.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["file-submissions"] });
		},
	});
};
