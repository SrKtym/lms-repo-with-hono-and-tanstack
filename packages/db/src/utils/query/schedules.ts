import { eq } from "drizzle-orm";
import { db } from "../../index";
import { schedules } from "../../schema";

export async function fetchSchedules(userId: string) {
	const schedulesList = await db
		.select()
		.from(schedules)
		.where(eq(schedules.createdBy, userId));

	return schedulesList;
}

export type FetchSchedulesReturnType = Awaited<
	ReturnType<typeof fetchSchedules>
>;

export async function fetchScheduleById(scheduleId: string) {
	const schedule = await db
		.select()
		.from(schedules)
		.where(eq(schedules.id, scheduleId));
	return schedule;
}
