import { eq } from "drizzle-orm";
import { db } from "../../index";
import { departments, students, user } from "../../schema";
import { createNotificationForUser, fail, ok } from "./helpers";

// 学生の所属（学年、学科）を登録する
export async function registerStudentData(
	userId: string,
	departmentName: string,
	grade: number,
) {
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
				.insert(students)
				.values({
					id: userId,
					departmentId: department.id,
					grade,
				})
				.onConflictDoNothing();
		});
		return ok("学生の所属登録に成功しました。", 201);
	} catch {
		return fail("学生の所属登録に失敗しました。", 500);
	}
}

// 教員ロールへの変更申請
export async function requestRoleChange(userId: string) {
	try {
		const result = await db.transaction(async (tx) => {
			// 通知の作成
			await createNotificationForUser(
				tx,
				{
					title: "教員ロール変更申請",
					description:
						"教員用アカウントへの変更を申請しました。承認されるまでお待ちください。",
					type: "system",
				},
				userId,
			);

			const [admin] = await tx
				.select({ email: user.email })
				.from(user)
				.where(eq(user.role, "admin"))
				.limit(1);

			if (!admin) {
				return fail("管理者が見つかりません。", 404);
			}

			return { adminEmail: admin.email };
		});
		return result;
	} catch {
		return fail("申請の送信に失敗しました。", 500);
	}
}
