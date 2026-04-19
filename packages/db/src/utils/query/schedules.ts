import { and, eq } from "drizzle-orm";
import { db } from "../../index";
import { schedules } from "../../schema";

export async function fetchSchedules(userId: string, scheduleId?: string) {
	const schedulesList = await db
		.select()
		.from(schedules)
		.where(
			scheduleId
				? and(eq(schedules.id, scheduleId), eq(schedules.createdBy, userId))
				: eq(schedules.createdBy, userId),
		);
	return schedulesList;
}

export type FetchSchedulesReturnType = Awaited<
	ReturnType<typeof fetchSchedules>
>;
