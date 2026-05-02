import type { Session } from "@lms-repo/auth/server";
import { fetchAnnouncementsFromUserCourses } from "@lms-repo/db/utils/query/announcements";
import { Hono } from "hono";

// アナウンスメントに関するロジック
export const announcementsRoute = new Hono<{
	Variables: {
		user: Session["user"];
		session: Session["session"];
	};
}>()
	.post("/", async (c) => {
		return c.json({ message: "announcement created" }, 201);
	})
	.get("/", async (c) => {
		const { userId } = c.get("session");
		const announcements = await fetchAnnouncementsFromUserCourses(userId);
		return c.json(announcements);
	});
