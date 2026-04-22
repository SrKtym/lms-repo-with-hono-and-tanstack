import { and, eq } from "drizzle-orm";
import { db } from "../../index";
import {
	courses,
	departments,
	faculties,
	registration,
	user,
} from "../../schema";

export async function fetchCourses(weekdays: number, period: number) {
	const courseList = await db
		.select({
			id: courses.id,
			name: courses.name,
			weekdays: courses.weekdays,
			period: courses.period,
			credits: courses.credits,
			targetGrade: courses.targetGrade,
			targetFaculty: faculties.name,
			targetDepartment: departments.name,
			requirements: courses.requirements,
			classRoom: courses.classRoom,
			professor: user.name,
		})
		.from(courses)
		.innerJoin(user, eq(courses.professorId, user.id))
		.innerJoin(departments, eq(courses.departmentId, departments.id))
		.innerJoin(faculties, eq(departments.facultyId, faculties.id))
		.where(and(eq(courses.weekdays, weekdays), eq(courses.period, period)));

	return courseList;
}

export async function fetchRegisteredCourses(userId: string) {
	const registeredCourseList = await db
		.select({
			id: courses.id,
			name: courses.name,
			weekdays: courses.weekdays,
			period: courses.period,
			credits: courses.credits,
			targetGrade: courses.targetGrade,
			requirements: courses.requirements,
			classRoom: courses.classRoom,
			professor: user.name,
		})
		.from(courses)
		.innerJoin(registration, eq(courses.id, registration.courseId))
		.innerJoin(user, eq(registration.userId, user.id))
		.where(eq(registration.userId, userId));

	return registeredCourseList;
}

export type FetchCoursesReturnType = Awaited<ReturnType<typeof fetchCourses>>;
export type FetchRegisteredCoursesReturnType = Awaited<
	ReturnType<typeof fetchRegisteredCourses>
>;
