import { db } from "../../index";
import { courses } from "../../schema";
import type { Courses } from "../../types";

export async function createCourses(coursesData: Courses) {
	try {
		await db.insert(courses).values(coursesData).onConflictDoNothing();
		return { message: "講義の作成に成功しました。", status: 201 };
	} catch (error) {
		return { message: "講義の作成に失敗しました。", status: 500 };
	}
}
