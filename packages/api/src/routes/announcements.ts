import { zValidator } from "@hono/zod-validator";
import type { Session } from "@lms-repo/auth/server";
import { createAnnouncements } from "@lms-repo/db/utils/mutation/announcements";
import { fetchAnnouncementsFromUserCourses } from "@lms-repo/db/utils/query/announcements";
import { Hono } from "hono";
import { z } from "zod";

const formSchema = z.object({
	title: z.string().min(1, "タイトルは必須です"),
	description: z
		.string()
		.min(1, "説明は必須です")
		.max(500, "説明は500文字以内で入力してください"),
	type: z.string().min(1, "アナウンスメントの形式を選択してください"),
	courseId: z.string().min(1),
});

// アナウンスメントに関するロジック
export const announcementsRoute = new Hono<{
	Variables: {
		user: Session["user"];
		session: Session["session"];
	};
}>()
	.post("/", zValidator("json", formSchema), async (c) => {
		const announcementData = c.req.valid("json");
		const result = await createAnnouncements(announcementData);
		return c.json(result, 201);
	})
	.get("/", async (c) => {
		const { userId } = c.get("session");
		const announcements = await fetchAnnouncementsFromUserCourses(userId);
		return c.json(announcements);
	});
