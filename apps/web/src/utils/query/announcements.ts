import { client } from "../../lib/hono-client";

// お知らせ取得用のqueryFn
export const fetchAnnouncementsQueryFn = async (courseId?: string) => {
	const res = await client.api.announcements.$get({
		query: {
			courseId,
		},
	});
	const data = await res.json();
	const parsedData = data.map((announcement) => ({
		...announcement,
		createdAt: new Date(announcement.createdAt),
		updatedAt: new Date(announcement.updatedAt),
	}));
	return parsedData;
};
