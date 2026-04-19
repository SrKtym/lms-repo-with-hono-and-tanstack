import { db } from "../../index";
import { courses } from "../../schema";
import type { Courses } from "../../types";

export async function createCourses(coursesData: Courses) {
	const coursesList = await db.insert(courses).values(coursesData);
	return coursesList;
}
