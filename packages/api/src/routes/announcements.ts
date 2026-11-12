import { zValidator } from "@hono/zod-validator";
import type { Session } from "@lms-repo/auth/server";
import { createAnnouncements } from "@lms-repo/db/utils/mutation/announcements";
import { fetchAnnouncementsFromUserCourses } from "@lms-repo/db/utils/query/announcements";
import { resend } from "@lms-repo/emails";
import NewAnnouncementEmail from "@lms-repo/emails/components/new-announcement-email";
import { env } from "@lms-repo/env/server";
import { Hono } from "hono";
import { formSchema } from "../schema/announcements";

// アナウンスメントに関するロジック（教員用）
export const announcementsRouteForProf = new Hono<{
	Variables: {
		user: Session["user"];
		session: Session["session"];
	};
}>()
	// アナウンスメントの作成
	.post(
		"/:course-id",
		zValidator("json", formSchema, (result, c) => {
			if (!result.success) {
				const firstError = result.error.issues[0]?.message;
				return c.json({ error: firstError }, 400);
			}
		}),
		async (c) => {
			const { "course-id": courseId } = c.req.param();
			const announcementData = c.req.valid("json");
			const result = await createAnnouncements({
				...announcementData,
				courseId,
			});

			if ("error" in result) {
				const { status, ...body } = result;
				return c.json(body, status);
			}
			if ("warning" in result) {
				const { status, ...body } = result;
				return c.json(body, status);
			}

			const { emails, title, description } = result;

			const viewUrl = `${env.CORS_ORIGIN}/notifications`;

			// バッチでメールを送信（全員に同じ内容）
			const batchEmails = emails.map((email) => ({
				from: `LMS-repo <${env.EMAIL_ADDRESS}>`,
				to: email,
				subject: "新しいお知らせ",
				react: NewAnnouncementEmail({
					announcementTitle: title,
					announcementContent: description,
					viewUrl,
				}),
			}));

			await resend.batch.send(batchEmails);

			return c.json({ message: "アナウンスメントを作成しました" }, 201);
		},
	);

// アナウンスメントに関するロジック（共通）
export const announcementsRouteForCommon = new Hono<{
	Variables: {
		user: Session["user"];
		session: Session["session"];
	};
}>()
	// アナウンスメントの取得
	.get("/:course-id?", async (c) => {
		const { userId } = c.get("session");
		const { "course-id": courseId } = c.req.param();
		const announcements = await fetchAnnouncementsFromUserCourses(
			userId,
			courseId,
		);
		return c.json(announcements, 200);
	});
