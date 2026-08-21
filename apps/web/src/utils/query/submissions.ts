import { client } from "../../lib/hono-client";

// テキスト提出取得用のqueryFn
export const fetchTextSubmissionsQueryFn = async (assignmentId?: string) => {
	if (!assignmentId) {
		return [];
	}
	const res = await client.api.submissions.text[":assignmentId"].$get({
		param: {
			assignmentId,
		},
	});
	const data = await res.json();
	return data;
};

// 課題提出状況取得用のqueryFn
export const fetchSubmissionsStatusQueryFn = async (assignmentId?: string) => {
	const res = await client.api.submissions.status.$get({
		query: {
			assignmentId,
		},
	});
	const data = await res.json();
	return data;
};

// 指定された課題のすべての提出状況を取得するqueryFn（教員用、ページネーション対応）
export const fetchAllSubmissionsWithStudentsQueryFn = async (
	assignmentId: string,
	limit = 10,
	offset = 0,
) => {
	const queryParams: Record<string, string> = {};

	if (limit !== undefined) {
		queryParams.limit = limit.toString();
	}
	if (offset !== undefined) {
		queryParams.offset = offset.toString();
	}

	const res = await client.api.professors.submissions.status.all.$get({
		query: { assignmentId, ...queryParams },
	});

	const data = await res.json();
	return data;
};

// ファイルメタデータ取得用のqueryFn
export const fetchFileMetadataQueryFn = async (assignmentId?: string) => {
	if (!assignmentId) {
		return [];
	}
	const res = await client.api.submissions.files[":assignmentId"].$get({
		param: { assignmentId },
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
