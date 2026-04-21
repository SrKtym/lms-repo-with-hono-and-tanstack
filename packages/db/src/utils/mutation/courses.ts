import { db } from "../../index";
import { courses, registration } from "../../schema";
import type { Courses } from "../../types";
import { and, eq } from "drizzle-orm";

export async function createCourses(coursesData: Courses) {
	try {
		await db.insert(courses).values(coursesData).onConflictDoNothing();
		return { message: "講義の作成に成功しました。", status: 201 };
	} catch (error) {
		return { message: "講義の作成に失敗しました。", status: 500 };
	}
}

export async function deleteCourse(courseId: string, userId: string) {
	try {
		await db.delete(registration).where(and(eq(registration.courseId, courseId), eq(registration.userId, userId)));
		return { message: "講義の登録解除に成功しました。", status: 200 };
	} catch (error) {
		return { message: "講義の登録解除に失敗しました。", status: 500 };
	}
}
