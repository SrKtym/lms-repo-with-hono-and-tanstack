import { eq } from "drizzle-orm";
import { db } from "../..";
import { departments, professors } from "../../schema";

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
				return { error: "学科が見つかりません。", status: 404 };
			}

			await tx
				.insert(professors)
				.values({
					id: userId,
					departmentId: department.id,
				})
				.onConflictDoNothing();
		});
		return { message: "学生の所属登録に成功しました。", status: 201 };
	} catch {
		return { error: "学生の所属登録に失敗しました。", status: 500 };
	}
}
