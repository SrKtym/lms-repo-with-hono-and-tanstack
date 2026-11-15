import { parseDatesInArray } from "@lms-repo/ui/utils/datetime";
import { client } from "../../lib/hono-client";

// お知らせ取得用のqueryFn
export const fetchAnnouncementsQueryFn = async (courseId: string) => {
	const res = await client.api.courses[":course-id"].announcements.$get({
		param: {
			"course-id": courseId,
		},
	});
	const data = await res.json();
	return parseDatesInArray(data, ["createdAt", "updatedAt"]);
};
