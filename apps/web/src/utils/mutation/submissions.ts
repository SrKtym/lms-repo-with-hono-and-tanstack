import { client } from "@/lib/hono-client";

// ファイル削除のmutationFn
export const deleteFileMutationFn = async (fileId: string) => {
	const res = await client.api.students.submissions.files[":id"].$delete({
		param: { id: fileId },
	});

	const result = await res.json();

	return result;
};

// テキスト提出のmutationFn
export const createTextSubmissionMutationFn = async (submissionData: {
	title: string;
	description: string;
	assignmentId: string;
}) => {
	const { assignmentId, ...rest } = submissionData;
	const res = await client.api.students.submissions[
		":assignment-id"
	].text.$post({
		param: { "assignment-id": assignmentId },
		json: rest,
	});

	const result = await res.json();

	return result;
};

// テキスト提出物削除のmutationFn
export const deleteTextSubmissionMutationFn = async (submissionId: string) => {
	const res = await client.api.students.submissions.text[":id"].$delete({
		param: { id: submissionId },
	});

	const result = await res.json();

	return result;
};

// 複数ファイルアップロードのmutationFn（n+1問題を回避）
export const submitMultipleFilesMutationFn = async ({
	files,
	assignmentId,
}: {
	files: File[];
	assignmentId: string;
}) => {
	// エミュレータ環境かどうかを判定（環境変数などで判断）
	const isEmulator = import.meta.env.DEV;

	if (isEmulator) {
		// エミュレータ環境：1回のリクエストで複数ファイルを一括アップロード
		const uploadRes = await client.api.students.submissions[
			":assignment-id"
		].upload.$post({
			param: { "assignment-id": assignmentId },
			form: {
				files,
			},
		});
		if (!uploadRes.ok) {
			throw new Error("ファイルのアップロードに失敗しました");
		}
		// サーバーから返ってきたメタデータ配列
		const uploadedMetadata = await uploadRes.json();
		// メタデータを一括保存
		const metadataRes = await client.api.students.submissions[
			":assignment-id"
		].files.$post({
			param: { "assignment-id": assignmentId },
			json: {
				metadataList: uploadedMetadata,
			},
		});
		return metadataRes.json();
	}
	// 本番環境：署名付きURLを使用
	// 1. 署名付きURLを一括取得（1回のAPIリクエスト）
	const signedUrlsRes = await client.api.submissions["signed-urls"].$post({
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
			if (!file) {
				throw new Error(`ファイル ${fileName} が見つかりません`);
			}

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
	const metadataRes = await client.api.students.submissions[
		":assignment-id"
	].files.$post({
		param: { "assignment-id": assignmentId },
		json: {
			metadataList: uploadedMetadata,
		},
	});

	return metadataRes.json();
};

// 採点のmutationFn（教員用）
export const gradeSubmissionMutationFn = async ({
	userId,
	assignmentId,
	score,
}: {
	userId: string;
	assignmentId: string;
	score: number;
}) => {
	const res = await client.api.professors.submissions[
		":assignment-id"
	].grade.$post({
		param: { "assignment-id": assignmentId },
		json: { userId, score },
	});

	const result = await res.json();

	return result;
};
