import { db } from "../../index";
import { schedules } from "../../schema";
import type { Schedules } from "../../types";
import { eq } from "drizzle-orm";

export async function createSchedules(schedulesData: Schedules) {
	const schedulesList = await db.insert(schedules).values(schedulesData);
	return schedulesList;
}

export async function updateSchedules(schedulesData: Schedules) {
	const schedulesList = await db.update(schedules).set(schedulesData);
	return schedulesList;
}

export async function deleteSchedules(schedulesData: Schedules) {
    if (!schedulesData.id) {
        throw new Error("Schedule is not found");
    }
	const schedulesList = await db.delete(schedules).where(eq(schedules.id, schedulesData.id));
	return schedulesList;
}