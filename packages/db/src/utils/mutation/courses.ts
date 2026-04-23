import { and, eq } from "drizzle-orm";
import { db } from "../../index";
import { courses, registration } from "../../schema";
import type { Courses } from "../../types";

export async function createCourses(coursesData: Courses) {
	try {
		await db.insert(courses).values(coursesData).onConflictDoNothing();
		return { message: "講義の作成に成功しました。", status: 201 };
	} catch (error) {
		return { message: "講義の作成に失敗しました。", status: 500 };
	}
}

export async function registerCourses(courseId: string, userId: string) {
	try {
		return await db.transaction(async (tx) => {
			// 登録しようとする講義の曜日・時限を取得
			const targetCourse = await tx
				.select({
					weekdays: courses.weekdays,
					period: courses.period,
				})
				.from(courses)
				.where(eq(courses.id, courseId))
				.limit(1);

			if (targetCourse.length === 0) {
				return { message: "指定された講義が見つかりません。", status: 404 };
			}

			const courseData = targetCourse[0];
			if (!courseData) {
				return { message: "指定された講義が見つかりません。", status: 404 };
			}
			const { weekdays, period } = courseData;

			// ユーザーが既に同じ曜日・時限の講義を登録していないかチェック
			// 1つのクエリで重複チェックと講義名取得を同時に行う
			const conflictingCourse = await tx
				.select({
					courseId: courses.id,
					courseName: courses.name,
				})
				.from(registration)
				.innerJoin(courses, eq(registration.courseId, courses.id))
				.where(
					and(
						eq(registration.userId, userId),
						eq(courses.weekdays, weekdays),
						eq(courses.period, period),
					),
				)
				.limit(1);

			if (conflictingCourse.length > 0) {
				const existingCourse = conflictingCourse[0];
				if (existingCourse) {
					return {
						message: `この曜日・時限には既に「${existingCourse.courseName}」を登録しています。重複登録はできません。`,
						status: 409,
					};
				}
			}

			// 重複がなければ講義を登録
			await tx
				.insert(registration)
				.values({
					userId,
					courseId,
				})
				.onConflictDoNothing();

			return { message: "講義の登録に成功しました。", status: 201 };
		});
	} catch (error) {
		console.error("講義登録エラー:", error);
		return { message: "講義の登録に失敗しました。", status: 500 };
	}
}

export async function deleteCourse(courseId: string, userId: string) {
	try {
		await db
			.delete(registration)
			.where(
				and(
					eq(registration.courseId, courseId),
					eq(registration.userId, userId),
				),
			);
		return { message: "講義の登録解除に成功しました。", status: 200 };
	} catch (error) {
		return { message: "講義の登録解除に失敗しました。", status: 500 };
	}
}
