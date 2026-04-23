import { zValidator } from "@hono/zod-validator";
import type { Session } from "@lms-repo/auth/server";
import type { Schedules, SchedulesOptional } from "@lms-repo/db/types";
import {
	createSchedules,
	deleteSchedules,
} from "@lms-repo/db/utils/mutation/schedules";
import { fetchSchedules } from "@lms-repo/db/utils/query/schedules";
import { Hono } from "hono";
import { z } from "zod";

// スケジュールに関するロジック
export const schedulesRoute = new Hono<{
	Variables: {
		user: Session["user"];
		session: Session["session"];
	};
}>()
	.get(
		"/select", 
		zValidator("param", z.string().optional()), 
		async (c) => {
			const { userId } = c.get("session");
			const scheduleId = c.req.valid("param");
			const result = await fetchSchedules(userId, scheduleId);
			return c.json(result, 200);
		})
	.post(
		"/create",
		zValidator("json", z.custom<Omit<Schedules, SchedulesOptional>>()),
		async (c) => {
			const { userId } = c.get("session");
			const scheduleData = c.req.valid("json");
			const result = await createSchedules({
				...scheduleData,
				createdBy: userId,
			});
			return c.json(result);
		},
	)
	.post(
		"/delete", 
		zValidator("json", z.string()), 
		async (c) => {
			const scheduleId = c.req.valid("json");
			const result = await deleteSchedules(scheduleId);
			return c.json(result);
		});
