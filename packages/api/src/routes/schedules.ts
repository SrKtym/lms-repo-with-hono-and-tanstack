import { zValidator } from "@hono/zod-validator";
import type { Session } from "@lms-repo/auth/server";
import {
	createSchedules,
	deleteSchedules,
} from "@lms-repo/db/utils/mutation/schedules";
import { fetchSchedules } from "@lms-repo/db/utils/query/schedules";
import { Hono } from "hono";
import { formSchema } from "../schema/schedules";

// スケジュールに関するロジック
export const schedulesRouteForStudent = new Hono<{
	Variables: {
		user: Session["user"];
		session: Session["session"];
	};
}>()
	// スケジュール作成
	.post(
		"/",
		zValidator("json", formSchema, (result, c) => {
			if (!result.success) {
				const firstError = result.error.issues[0]?.message;
				return c.json({ error: firstError }, 400);
			}
		}),
		async (c) => {
			const { userId } = c.get("session");
			const scheduleData = c.req.valid("json");
			const { status, ...body } = await createSchedules({
				...scheduleData,
				createdBy: userId,
			});
			return c.json(body, status);
		},
	)
	// スケジュール一覧取得
	.get("/", async (c) => {
		const { userId } = c.get("session");
		const result = await fetchSchedules(userId);
		return c.json(result, 200);
	})
	// スケジュール削除
	.delete("/:schedule-id", async (c) => {
		const { "schedule-id": scheduleId } = c.req.param();
		const { status, ...body } = await deleteSchedules(scheduleId);
		return c.json(body, status);
	});
