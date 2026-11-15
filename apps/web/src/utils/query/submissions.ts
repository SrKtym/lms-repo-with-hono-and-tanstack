import { client } from "../../lib/hono-client";

// テキスト提出取得用のqueryFn
export const fetchTextSubmissionsQueryFn = async (
	courseId: string,
	assignmentId: string,
) => {
	const res = await client.api.courses[":course-id"].assignments[
		":assignment-id"
	].submissions.text.$get({
		param: { "course-id": courseId, "assignment-id": assignmentId },
	});
	const data = await res.json();
	return data;
};

// 課題提出状況取得用のqueryFn
export const fetchSubmissionsStatusQueryFn = async (
	courseId: string,
	assignmentId: string,
) => {
	const res = await client.api.courses[":course-id"].assignments[
		":assignment-id"
	].submissions.status.$get({
		param: {
			"course-id": courseId,
			"assignment-id": assignmentId,
		},
	});
	const data = await res.json();
	return data;
};

// 指定された課題のすべての提出状況を取得するqueryFn（教員用、ページネーション対応）
export const fetchAllSubmissionsWithStudentsQueryFn = async (
	courseId: string,
	assignmentId: string,
	limit: number,
	offset: number,
) => {
	const res = await client.api.courses[":course-id"].assignments[
		":assignment-id"
	].submissions.$get({
		param: { "course-id": courseId, "assignment-id": assignmentId },
		query: {
			limit: limit.toString(),
			offset: offset.toString(),
		},
	});

	const data = await res.json();
	return data;
};

// ファイルメタデータ取得用のqueryFn
export const fetchFileMetadataQueryFn = async (
	courseId: string,
	assignmentId: string,
) => {
	const res = await client.api.courses[":course-id"].assignments[
		":assignment-id"
	].submissions.files.$get({
		param: { "course-id": courseId, "assignment-id": assignmentId },
	});
	const data = await res.json();
	return data;
};

// ダウンロードURL取得用のqueryFn
export const fetchDownloadUrlQueryFn = async (
	fileId: string,
	courseId: string,
	assignmentId: string,
) => {
	const res = await client.api.courses[":course-id"].assignments[
		":assignment-id"
	].submissions.files[":id"].download.$get({
		param: {
			"course-id": courseId,
			"assignment-id": assignmentId,
			id: fileId,
		},
	});
	const result = await res.json();
	return result;
};
