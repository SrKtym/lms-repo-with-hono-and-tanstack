import { client } from "@/lib/hono-client";

// ファイル削除のmutationFn
export const deleteFileMutationFn = async ({
	fileId,
	courseId,
	assignmentId,
}: {
	fileId: string;
	courseId: string;
	assignmentId: string;
}) => {
	const res = await client.api.courses[":course-id"].assignments[
		":assignment-id"
	].submissions.files[":id"].$delete({
		param: { "course-id": courseId, "assignment-id": assignmentId, id: fileId },
	});

	const result = await res.json();

	return result;
};

// テキスト提出のmutationFn
export const createTextSubmissionMutationFn = async (submissionData: {
	title: string;
	description: string;
	assignmentId: string;
	courseId: string;
}) => {
	const { assignmentId, courseId, ...rest } = submissionData;
	const res = await client.api.courses[":course-id"].assignments[
		":assignment-id"
	].submissions.text.$post({
		param: { "course-id": courseId, "assignment-id": assignmentId },
		json: rest,
	});

	const result = await res.json();

	return result;
};

// テキスト提出物削除のmutationFn
export const deleteTextSubmissionMutationFn = async ({
	submissionId,
	courseId,
	assignmentId,
}: {
	submissionId: string;
	courseId: string;
	assignmentId: string;
}) => {
	const res = await client.api.courses[":course-id"].assignments[
		":assignment-id"
	].submissions.text[":id"].$delete({
		param: {
			"course-id": courseId,
			"assignment-id": assignmentId,
			id: submissionId,
		},
	});

	const result = await res.json();

	return result;
};

// 複数ファイルアップロードのmutationFn（n+1問題を回避）
export const submitMultipleFilesMutationFn = async ({
	files,
	assignmentId,
	courseId,
}: {
	files: File[];
	assignmentId: string;
	courseId: string;
}) => {
	// エミュレータ環境かどうかを判定（環境変数などで判断）
	const isEmulator = import.meta.env.DEV;

	if (isEmulator) {
		// エミュレータ環境：1回のリクエストで複数ファイルを一括アップロード
		const res = await client.api.courses[":course-id"].assignments[
			":assignment-id"
		].submissions.upload.$post({
			param: { "course-id": courseId, "assignment-id": assignmentId },
			form: {
				files,
			},
		});

		const metadataList = await res.json();

		if ("error" in metadataList) {
			return metadataList;
		}

		// メタデータを一括保存
		const metadataRes = await client.api.courses[":course-id"].assignments[
			":assignment-id"
		].submissions.files.$post({
			param: { "course-id": courseId, "assignment-id": assignmentId },
			json: {
				metadataList,
			},
		});
		return metadataRes.json();
	}

	// 本番環境：署名付きURLを使用
	// 1. 署名付きURLを一括取得（1回のAPIリクエスト）
	const signedUrlsRes = await client.api.courses[":course-id"].assignments[
		":assignment-id"
	].submissions["signed-urls"].$post({
		param: { "course-id": courseId, "assignment-id": assignmentId },
		json: files.map((file) => ({
			fileName: file.name,
			fileType: file.type,
			fileSize: file.size,
		})),
	});
	const signedUrls = await signedUrlsRes.json();

	if ("error" in signedUrls) {
		return signedUrls;
	}

	// 2. Cloud Storageにファイルを並列アップロード（クライアントから直接アップロード）
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
	const metadataRes = await client.api.courses[":course-id"].assignments[
		":assignment-id"
	].submissions.files.$post({
		param: { "course-id": courseId, "assignment-id": assignmentId },
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
	courseId,
	score,
}: {
	userId: string;
	assignmentId: string;
	courseId: string;
	score: number;
}) => {
	const res = await client.api.courses[":course-id"].assignments[
		":assignment-id"
	].submissions.grade.$post({
		param: { "course-id": courseId, "assignment-id": assignmentId },
		json: { userId, score },
	});

	const result = await res.json();

	return result;
};
