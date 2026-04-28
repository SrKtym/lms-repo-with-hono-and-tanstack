import { eq } from "drizzle-orm";
import { db } from "../../index";
import {
	assignments,
	courses,
	registration,
	submissionStatus,
} from "../../schema";

// ユーザーが登録している講義の担当教員からの課題を取得
export async function fetchAssignmentsFromUserCourses(userId: string) {
	const assignmentsList = await db
		.select({
			id: assignments.id,
			title: assignments.title,
			description: assignments.description,
			points: assignments.points,
			dueDate: assignments.dueDate,
			format: assignments.format,
			status: submissionStatus.status,
			score: submissionStatus.score,
			courseName: courses.name,
		})
		.from(assignments)
		.innerJoin(
			submissionStatus,
			eq(assignments.id, submissionStatus.assignmentId),
		)
		.innerJoin(courses, eq(assignments.courseId, courses.id))
		.innerJoin(registration, eq(courses.id, registration.courseId))
		.where(eq(registration.userId, userId));

	return assignmentsList;
}

export type FetchAssignmentsFromUserCoursesReturnType = Awaited<
	ReturnType<typeof fetchAssignmentsFromUserCourses>
>;

// IDから課題を取得
export async function fetchAssignmentById(assignmentId: string) {
	const assignment = await db
		.select({
			id: assignments.id,
			title: assignments.title,
			description: assignments.description,
			points: assignments.points,
			dueDate: assignments.dueDate,
			format: assignments.format,
		})
		.from(assignments)
		.where(eq(assignments.id, assignmentId));

	return assignment;
}

export type FetchAssignmentByIdReturnType = Awaited<
	ReturnType<typeof fetchAssignmentById>
>;
