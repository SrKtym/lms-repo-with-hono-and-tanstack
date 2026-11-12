import { client } from "../../lib/hono-client";

// テキスト提出取得用のqueryFn
export const fetchTextSubmissionsQueryFn = async (assignmentId: string) => {
	const res = await client.api.submissions[":assignment-id"].text.$get({
		param: {
			"assignment-id": assignmentId,
		},
	});
	const data = await res.json();
	return data;
};

// 課題提出状況取得用のqueryFn
export const fetchSubmissionsStatusQueryFn = async (assignmentId?: string) => {
	if (assignmentId) {
		const res = await client.api.students.submissions[
			":assignment-id"
		].status.$get({
			param: {
				"assignment-id": assignmentId,
			},
		});
		const data = await res.json();
		return data;
	}
	const res = await client.api.students.submissions.status.$get();
	const data = await res.json();
	return data;
};

// 指定された課題のすべての提出状況を取得するqueryFn（教員用、ページネーション対応）
export const fetchAllSubmissionsWithStudentsQueryFn = async (
	assignmentId: string,
	limit: number,
	offset: number,
) => {
	const res = await client.api.professors.submissions[":assignment-id"].$get({
		param: {
			"assignment-id": assignmentId,
		},
		query: {
			limit: limit.toString(),
			offset: offset.toString(),
		},
	});

	const data = await res.json();
	return data;
};

// ファイルメタデータ取得用のqueryFn
export const fetchFileMetadataQueryFn = async (assignmentId: string) => {
	const res = await client.api.submissions[":assignment-id"].files.$get({
		param: { "assignment-id": assignmentId },
	});
	const data = await res.json();
	return data;
};

// ダウンロードURL取得用のqueryFn
export const fetchDownloadUrlQueryFn = async (fileId: string) => {
	const res = await client.api.submissions.files[":id"].download.$get({
		param: { id: fileId },
	});
	const result = await res.json();
	return result;
};
