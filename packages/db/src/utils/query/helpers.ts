import { and, eq } from "drizzle-orm";
import { db } from "../../index";
import { assignments, courses, registration } from "../../schema";

export type CourseAccessLevel = "professor" | "student" | "admin";

export interface CourseAccess {
	course: {
		id: string;
		name: string;
		professorId: string;
	};
	access: CourseAccessLevel;
}

export interface AssignmentAccess extends CourseAccess {
	assignment: {
		id: string;
		title: string;
		courseId: string;
	};
}

interface AccessOptions {
	isAdmin?: boolean;
}

// リソースレベルでの認可制御
export async function fetchCourseAccess(
	userId: string,
	courseId: string,
	{ isAdmin = false }: AccessOptions = {},
): Promise<CourseAccess | null> {
	const [course] = await db
		.select({
			id: courses.id,
			name: courses.name,
			professorId: courses.professorId,
		})
		.from(courses)
		.where(eq(courses.id, courseId))
		.limit(1);

	if (!course) {
		return null;
	}

	if (isAdmin) {
		return { course, access: "admin" };
	}

	if (course.professorId === userId) {
		return { course, access: "professor" };
	}

	const [registrationData] = await db
		.select({ userId: registration.userId })
		.from(registration)
		.where(
			and(eq(registration.courseId, courseId), eq(registration.userId, userId)),
		)
		.limit(1);

	if (registrationData) {
		return { course, access: "student" };
	}

	return null;
}

// 課題が指定された講義に属し、ユーザーがその講義へアクセスできるか確認
export async function fetchAssignmentAccess(
	userId: string,
	courseId: string,
	assignmentId: string,
	options: AccessOptions = {},
): Promise<AssignmentAccess | null> {
	const courseAccess = await fetchCourseAccess(userId, courseId, options);
	if (!courseAccess) {
		return null;
	}

	const [assignment] = await db
		.select({
			id: assignments.id,
			title: assignments.title,
			courseId: assignments.courseId,
		})
		.from(assignments)
		.where(
			and(eq(assignments.id, assignmentId), eq(assignments.courseId, courseId)),
		)
		.limit(1);

	if (!assignment) {
		return null;
	}

	return { ...courseAccess, assignment };
}
