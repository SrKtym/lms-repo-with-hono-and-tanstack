import { zValidator } from "@hono/zod-validator";
import type { Session } from "@lms-repo/auth/server";
import type { EmailNotificationSettings } from "@lms-repo/db/types";
import { updateEmailNotificationSettings } from "@lms-repo/db/utils/mutation/settings";
import { fetchEmailNotificationSettings } from "@lms-repo/db/utils/query/settings";
import { Hono } from "hono";
import { z } from "zod";

export const settingsRouteForCommon = new Hono<{
	Variables: {
		user: Session["user"];
		session: Session["session"];
	};
}>()
	// メール通知設定更新
	.post(
		"/email-notification",
		zValidator("json", z.custom<Omit<EmailNotificationSettings, "userId">>()),
		async (c) => {
			const { userId } = c.get("session");
			const emailNotificationSettings = c.req.valid("json");
			const { status, ...body } = await updateEmailNotificationSettings({
				...emailNotificationSettings,
				userId,
			});
			return c.json(body, status);
		},
	)
	// メール通知設定取得
	.get("/email-notification", async (c) => {
		const { userId } = c.get("session");
		const result = await fetchEmailNotificationSettings(userId);
		return c.json(result, 200);
	});
