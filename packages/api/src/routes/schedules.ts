import { zValidator } from "@hono/zod-validator";
import type { Session } from "@lms-repo/auth/server";
import type { Schedules, SchedulesOptional } from "@lms-repo/db/types";
import {
	createSchedules,
	deleteSchedules,
} from "@lms-repo/db/utils/mutation/schedules";
import {
	fetchScheduleById,
	fetchSchedules,
} from "@lms-repo/db/utils/query/schedules";
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
		async (c) => {
			const { userId } = c.get("session");
			const result = await fetchSchedules(userId);
			return c.json(result, 200);
		},
	)
	.get(
		"/select/:scheduleId",
		async (c) => {
			const scheduleId = c.req.param("scheduleId");
			const result = await fetchScheduleById(scheduleId);
			return c.json(result, 200);
		},
	)
	.post(
		"/create",
		zValidator("form", z.custom<Omit<Schedules, SchedulesOptional>>()),
		async (c) => {
			const { userId } = c.get("session");
			const scheduleData = c.req.valid("form");
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
		},
	);
