import { eq, or } from "drizzle-orm";
import { db } from "../../index";
import { assignments, courses, registration } from "../../schema";

// ユーザーが登録している講義の担当教員からの課題を取得（教員自身も作成した課題を取得）
export async function fetchAssignmentsFromUserCourses(
	userId: string,
	courseId?: string,
) {
	const assignmentsList = await db
		.selectDistinct({
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
		.leftJoin(registration, eq(courses.id, registration.courseId))
		.where(
			or(
				eq(registration.userId, userId),
				eq(courses.professorId, userId),
				courseId ? eq(assignments.courseId, courseId) : undefined,
			),
		);

	return assignmentsList;
}

export type FetchAssignmentsFromUserCoursesReturnType = Awaited<
	ReturnType<typeof fetchAssignmentsFromUserCourses>
>;

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
