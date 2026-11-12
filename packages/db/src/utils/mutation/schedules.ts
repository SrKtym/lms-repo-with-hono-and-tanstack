import { eq } from "drizzle-orm";
import { db } from "../../index";
import { schedules } from "../../schema";
import type { Schedules } from "../../types";
import { fail, ok } from "./helpers";

// スケジュール作成・更新
export async function createSchedules(schedulesData: Schedules) {
	try {
		await db.insert(schedules).values(schedulesData).onConflictDoUpdate({
			target: schedules.id,
			set: schedulesData,
		});
		return ok("スケジュールの作成に成功しました。", 200);
	} catch {
		return fail("スケジュールの作成に失敗しました。", 500);
	}
}

// スケジュール削除
export async function deleteSchedules(scheduleId: string) {
	try {
		await db.delete(schedules).where(eq(schedules.id, scheduleId));
		return ok("スケジュールの削除に成功しました。", 200);
	} catch {
		return fail("スケジュールの削除に失敗しました。", 500);
	}
}
