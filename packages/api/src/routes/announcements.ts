import type { Session } from "@lms-repo/auth/server";
import {
	fetchAnnouncementsFromUserCourses,
	fetchAnnouncementsFromUserDeps,
	fetchAnnouncementsFromUserFaculties,
} from "@lms-repo/db/utils/query/announcements";
import { Hono } from "hono";

// アナウンスメントに関するロジック
export const announcementsRoute = new Hono<{
	Variables: {
		user: Session["user"];
		session: Session["session"];
	};
}>()
	.get(
		"/select/related-courses",
		async (c) => {
			const { userId } = c.get("session");
			const announcements = await fetchAnnouncementsFromUserCourses(userId);
			return c.json(announcements);
		},
	)
	.get(
		"/select/related-departments",
		async (c) => {
			const { userId } = c.get("session");
			const announcements = await fetchAnnouncementsFromUserDeps(userId);
			return c.json(announcements);
		},
	)
	.get(
		"/select/related-faculties",
		async (c) => {
			const { userId } = c.get("session");
			const announcements = await fetchAnnouncementsFromUserFaculties(userId);
			return c.json(announcements);
		},
	)
	.post(
		"/create",
		async (c) => {
			return c.json({ message: "announcement created" }, 201);
		},
	);
