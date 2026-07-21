import { zValidator } from "@hono/zod-validator";
import type { Session } from "@lms-repo/auth/server";
import { createAnnouncements } from "@lms-repo/db/utils/mutation/announcements";
import { fetchAnnouncementsFromUserCourses } from "@lms-repo/db/utils/query/announcements";
import { resend } from "@lms-repo/emails";
import NewAnnouncementEmail from "@lms-repo/emails/components/new-announcement-email";
import { env } from "@lms-repo/env/server";
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
	// アナウンスメントの作成
	.post("/", zValidator("json", formSchema), async (c) => {
		const { userId } = c.get("session");
		const announcementData = c.req.valid("json");
		const result = await createAnnouncements(announcementData, userId);

		if ("message" in result) {
			return c.json(result);
		}

		if (result[0]) {
			const { emails, title, description } = result[0];

			const viewUrl = `${env.CORS_ORIGIN}/dashboard`;

			await resend.emails.send({
				from: env.EMAIL_ADDRESS,
				to: emails,
				subject: "新しいお知らせ",
				react: NewAnnouncementEmail({
					announcementTitle: title,
					announcementContent: description,
					viewUrl,
				}),
			});
		}

		return c.json({ message: "アナウンスメントを作成しました", status: 201 });
	})
	// アナウンスメントの取得
	.get("/", async (c) => {
		const { userId } = c.get("session");
		const announcements = await fetchAnnouncementsFromUserCourses(userId);
		return c.json(announcements);
	});
