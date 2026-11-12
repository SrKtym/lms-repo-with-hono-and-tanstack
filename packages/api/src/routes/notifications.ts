import { zValidator } from "@hono/zod-validator";
import type { Session } from "@lms-repo/auth/server";
import {
	createReminder,
	deleteNotification,
	markNotificationAsRead,
} from "@lms-repo/db/utils/mutation/notifications";
import {
	fetchNotifications,
	fetchNotificationsCount,
} from "@lms-repo/db/utils/query/notifications";
import { resend } from "@lms-repo/emails";
import AssignmentReminderEmail from "@lms-repo/emails/components/assignment-reminder-email";
import { env } from "@lms-repo/env/server";
import { DATETIME_FORMAT_CONFIG } from "@lms-repo/shared/utils";
import { Hono } from "hono";
import { z } from "zod";

// 通知に関するロジック(学生用)
export const notificationsRouteForStudent = new Hono<{
	Variables: {
		user: Session["user"];
		session: Session["session"];
	};
}>()
	// 通知取得
	.get(
		"/",
		zValidator(
			"query",
			z.object({
				limit: z.coerce.number(),
				offset: z.coerce.number(),
			}),
		),
		async (c) => {
			const { userId } = c.get("session");
			const { limit, offset } = c.req.valid("query");

			const notificationList = await fetchNotifications(userId, limit, offset);
			return c.json(notificationList, 200);
		},
	)
	// 通知総数取得
	.get(
		"/count",
		zValidator(
			"query",
			z.object({ filter: z.enum(["all", "unread", "read"]).optional() }),
		),
		async (c) => {
			const { userId } = c.get("session");
			const { filter } = c.req.valid("query");
			const count = await fetchNotificationsCount(userId, filter);
			return c.json(count, 200);
		},
	)
	// すべての通知を既読
	.patch("/mark-as-read", async (c) => {
		const { userId } = c.get("session");
		const { status, ...body } = await markNotificationAsRead(userId);
		return c.json(body, status);
	})
	// 特定の通知を既読
	.patch(":notification-id/mark-as-read", async (c) => {
		const { userId } = c.get("session");
		const { "notification-id": notificationId } = c.req.param();
		const { status, ...body } = await markNotificationAsRead(
			userId,
			notificationId,
		);
		return c.json(body, status);
	})
	// 通知削除
	.delete("/:notification-id?", async (c) => {
		const { userId } = c.get("session");
		const { "notification-id": notificationId } = c.req.param();
		const { status, ...body } = await deleteNotification(
			userId,
			notificationId,
		);
		return c.json(body, status);
	});

// 通知に関するロジック(公開API)
export const notificationsRouteForCommon = new Hono()
	// リマインダーの作成（Cloud Schedulerによって定期実行される）
	.post("/reminder", async (c) => {
		const result = await createReminder();

		if ("error" in result) {
			const { status, ...body } = result;
			return c.json(body, status);
		}

		// 全ユーザーのメールアドレスを収集
		const { emails, reminders } = result;
		const assignmentsDetail = reminders.map((reminder) => ({
			title: reminder.title,
			description: reminder.description,
			dueDate: reminder.dueDate.toLocaleDateString(
				DATETIME_FORMAT_CONFIG.DEFAULT.defaultLocale,
				DATETIME_FORMAT_CONFIG.DEFAULT.options,
			),
		}));
		const viewUrl = `${env.CORS_ORIGIN}/notifications`;

		// バッチでメールを送信（全員に同じ内容）
		const batchEmails = emails.map((email) => ({
			from: `LMS-repo <${env.EMAIL_ADDRESS}>`,
			to: email,
			subject: "リマインダー通知",
			react: AssignmentReminderEmail({
				assignmentsDetail,
				viewUrl,
			}),
		}));

		await resend.batch.send(batchEmails);

		return c.json({ message: "リマインダーを作成しました" }, 201);
	});
