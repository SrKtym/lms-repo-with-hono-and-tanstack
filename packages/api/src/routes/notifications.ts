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
	.get("/", async (c) => {
		const { userId } = c.get("session");
		const { limit, offset } = c.req.query();

		const notificationList = await fetchNotifications(
			userId,
			Number(limit),
			Number(offset),
		);
		return c.json(notificationList, 200);
	})
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
			return c.json({ count }, 200);
		},
	)
	// 通知既読
	.patch(
		"/mark_as_read",
		zValidator("json", z.object({ notificationId: z.string() })),
		async (c) => {
			const { notificationId } = c.req.valid("json");
			const { userId } = c.get("session");
			const result = await markNotificationAsRead(userId, notificationId);
			return c.json(result);
		},
	)
	// すべての通知を既読にする
	.patch("/mark_all_as_read", async (c) => {
		const { userId } = c.get("session");
		const result = await markNotificationAsRead(userId);
		return c.json(result);
	})
	// 通知削除
	.delete(
		"/",
		zValidator("json", z.object({ notificationId: z.string() })),
		async (c) => {
			const { notificationId } = c.req.valid("json");
			const { userId } = c.get("session");
			const result = await deleteNotification(userId, notificationId);
			return c.json(result);
		},
	)
	// すべての通知を削除する
	.delete("/all", async (c) => {
		const { userId } = c.get("session");
		const result = await deleteNotification(userId);
		return c.json(result);
	});

// 通知に関するロジック(公開API)
export const notificationsRouteForCommon = new Hono()
	// リマインダーの作成（Cloud Schedulerによって定期実行される）
	.post("/reminder", async (c) => {
		const result = await createReminder();

		if ("error" in result) {
			return c.json(result);
		}

		if (result) {
			const dateOptions: Intl.DateTimeFormatOptions = {
				year: "numeric",
				month: "short",
				day: "numeric",
			};

			// 全ユーザーのメールアドレスを収集
			const { emails, reminders } = result;
			const assignmentsDetail = reminders.map((reminder) => ({
				title: reminder.title,
				description: reminder.description,
				dueDate: reminder.dueDate.toLocaleDateString("default", dateOptions),
			}));
			const viewUrl = `${env.CORS_ORIGIN}/notifications`;

			// バッチでメールを送信（全員に同じ内容）
			await resend.emails.send({
				from: env.EMAIL_ADDRESS,
				to: emails,
				subject: "リマインダー通知",
				react: AssignmentReminderEmail({
					assignmentsDetail,
					viewUrl,
				}),
			});
		}

		return c.json({ message: "リマインダーを作成しました" }, 201);
	});
