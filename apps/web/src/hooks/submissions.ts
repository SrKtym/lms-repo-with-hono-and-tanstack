import { useMutation } from "@tanstack/react-query";
import { client } from "@/lib/hono-client";
import { queryClient } from "@/lib/query-client";

// テキスト提出のフック
export const useCreateTextSubmission = () => {
	return useMutation({
		mutationFn: async (submissionData: {
			title: string;
			description: string;
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

// 複数ファイルアップロードのフック（n+1問題回避版）
export const useSubmitMultipleFiles = () => {
	return useMutation({
		mutationFn: async ({
			files,
			assignmentId,
		}: {
			files: File[];
			assignmentId: string;
		}) => {
			// 1. 署名付きURLを一括取得（1回のAPIリクエスト）
			const signedUrlsRes = await client.api.submissions.signed_urls.$post({
				json: files.map((file) => ({
					fileName: file.name,
					fileType: file.type,
				})),
			});
			const signedUrls = await signedUrlsRes.json();

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
