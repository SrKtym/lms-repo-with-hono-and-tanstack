import { eq } from "drizzle-orm";
import { db } from "../../index";
import { schedules } from "../../schema";

// スケジュール一覧を取得する関数
export async function fetchSchedules(userId: string) {
	const schedulesList = await db
		.select({
			id: schedules.id,
			title: schedules.title,
			description: schedules.description,
			startTime: schedules.startTime,
			endTime: schedules.endTime,
			theme: schedules.theme,
		})
		.from(schedules)
		.where(eq(schedules.createdBy, userId));

	return schedulesList;
}

export type FetchSchedulesReturnType = Awaited<
	ReturnType<typeof fetchSchedules>
>;
