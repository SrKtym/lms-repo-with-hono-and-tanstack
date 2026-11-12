import type { Announcements } from "@lms-repo/db/types";
import { client } from "@/lib/hono-client";

// アナウンスメントを作成するmutationFn
export const createAnnouncementMutationFn = async (
	announcementData: Announcements,
) => {
	const { courseId, ...rest } = announcementData;
	const res = await client.api.professors.announcements[":course-id"].$post({
		param: { "course-id": courseId },
		json: rest,
	});
	const data = await res.json();
	return data;
};
