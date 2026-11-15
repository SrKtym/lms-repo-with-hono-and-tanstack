import { and, eq } from "drizzle-orm";
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
		return ok("スケジュールの作成・編集に成功しました。", 200);
	} catch {
		return fail("スケジュールの作成・編集に失敗しました。", 500);
	}
}

// スケジュール削除
export async function deleteSchedules(scheduleId: string, userId: string) {
	try {
		const [deleted] = await db
			.delete(schedules)
			.where(and(eq(schedules.id, scheduleId), eq(schedules.createdBy, userId)))
			.returning({ id: schedules.id });

		if (!deleted) {
			return fail("スケジュールが見つかりません", 404);
		}

		return ok("スケジュールの削除に成功しました。", 200);
	} catch {
		return fail("スケジュールの削除に失敗しました。", 500);
	}
}
