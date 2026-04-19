import { eq } from "drizzle-orm";
import { db } from "../../index";
import { announcements } from "../../schema";

export async function fetchAnnouncements(announcementsId?: string) {
	const announcementsList = await db
		.select()
		.from(announcements)
		.where(announcementsId ? eq(announcements.id, announcementsId) : undefined);
	return announcementsList;
}

export type FetchAnnouncementsReturnType = Awaited<
	ReturnType<typeof fetchAnnouncements>
>;
