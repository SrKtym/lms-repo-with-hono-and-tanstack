import { eq } from "drizzle-orm";
import { db } from "../..";
import { departments, professors } from "../../schema";
import { fail, ok } from "./helpers";

// 教授データ登録
export async function registerProfData(userId: string, departmentName: string) {
	try {
		await db.transaction(async (tx) => {
			const [department] = await tx
				.select({ id: departments.id })
				.from(departments)
				.where(eq(departments.name, departmentName))
				.limit(1);

			if (!department) {
				return fail("学科が見つかりません。", 404);
			}

			await tx
				.insert(professors)
				.values({
					id: userId,
					departmentId: department.id,
				})
				.onConflictDoNothing();
		});
		return ok("学生の所属登録に成功しました。", 201);
	} catch {
		return fail("学生の所属登録に失敗しました。", 500);
	}
}
