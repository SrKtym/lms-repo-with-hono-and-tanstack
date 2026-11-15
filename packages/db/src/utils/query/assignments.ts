import { and, eq, exists, or } from "drizzle-orm";
import { db } from "../../index";
import { assignments, courses, registration } from "../../schema";

// ユーザーが登録している講義の担当教員からの課題を取得（教員自身も作成した課題を取得）
export async function fetchAssignmentsFromUserCourses(
	userId: string,
	courseId?: string,
	{ isAdmin = false }: { isAdmin?: boolean } = {},
) {
	const subQuery = db
		.select()
		.from(registration)
		.where(
			and(
				eq(registration.courseId, courses.id),
				eq(registration.userId, userId),
			),
		);

	const assignmentsList = await db
		.select({
			id: assignments.id,
			title: assignments.title,
			description: assignments.description,
			points: assignments.points,
			dueDate: assignments.dueDate,
			format: assignments.format,
			courseId: courses.id,
			courseName: courses.name,
		})
		.from(assignments)
		.innerJoin(courses, eq(assignments.courseId, courses.id))
		.where(
			isAdmin
				? courseId
					? eq(assignments.courseId, courseId)
					: undefined
				: and(
						courseId ? eq(assignments.courseId, courseId) : undefined,
						or(eq(courses.professorId, userId), exists(subQuery)),
					),
		);

	return assignmentsList;
}

export type FetchAssignmentsFromUserCoursesReturnType = Awaited<
	ReturnType<typeof fetchAssignmentsFromUserCourses>
>;

// 講義に属する単一の課題を取得
export async function fetchAssignmentByCourseAndId(
	courseId: string,
	assignmentId: string,
) {
	const [assignment] = await db
		.select({
			id: assignments.id,
			title: assignments.title,
			description: assignments.description,
			points: assignments.points,
			dueDate: assignments.dueDate,
			format: assignments.format,
			courseId: courses.id,
			courseName: courses.name,
		})
		.from(assignments)
		.innerJoin(courses, eq(assignments.courseId, courses.id))
		.where(
			and(eq(assignments.id, assignmentId), eq(assignments.courseId, courseId)),
		)
		.limit(1);

	return assignment;
}

// 課題の配点を取得
export async function fetchAssignmentPointsById(assignmentId: string) {
	const [assignment] = await db
		.select({
			points: assignments.points,
		})
		.from(assignments)
		.where(eq(assignments.id, assignmentId))
		.limit(1);

	return assignment?.points;
}
