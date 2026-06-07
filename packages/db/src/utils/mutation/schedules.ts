import { eq } from "drizzle-orm";
import { db } from "../../index";
import { schedules } from "../../schema";
import type { Schedules } from "../../types";

// スケジュール作成・更新
export async function createSchedules(schedulesData: Schedules) {
	try {
		await db
			.insert(schedules)
			.values(schedulesData)
			.onConflictDoUpdate({
				target: schedules.id,
				set: schedulesData,
			});
		return { message: "スケジュールの作成に成功しました。", status: 200 };
	} catch (error) {
		return { message: "スケジュールの作成に失敗しました。", status: 500 };
	}
}

// スケジュール削除
export async function deleteSchedules(scheduleId: string) {
	try {
		await db.delete(schedules).where(eq(schedules.id, scheduleId));
		return { message: "スケジュールの削除に成功しました。", status: 200 };
	} catch (error) {
		return { message: "スケジュールの削除に失敗しました。", status: 500 };
	}
}
