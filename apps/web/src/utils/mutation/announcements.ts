import { client } from "@/lib/hono-client";

// アナウンスメントを作成するmutationFn
export const createAnnouncementMutationFn = async (announcementData: {
	title: string;
	description: string;
	type: string;
	courseId: string;
}) => {
	const res = await client.api.professors.announcements.$post({
		json: announcementData,
	});
	const data = await res.json();
	return data;
};
