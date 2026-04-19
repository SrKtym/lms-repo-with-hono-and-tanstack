import { db } from "../../index";
import { announcements } from "../../schema";
import type { Announcements } from "../../types";

export async function createAnnouncements(announcementsData: Announcements) {
	const announcementsList = await db.insert(announcements).values(announcementsData);
	return announcementsList;
}