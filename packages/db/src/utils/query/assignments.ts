import { eq } from "drizzle-orm";
import { db } from "../../index";
import { assignments, registration } from "../../schema";

export async function fetchAssignments(courseId?: string) {
	if (!courseId) {
		return [];
	}
	const assignmentsList = await db
		.select({
			id: assignments.id,
			title: assignments.title,
			description: assignments.description,
			points: assignments.points,
			dueDate: assignments.dueDate,
			format: assignments.format,
		})
		.from(assignments)
		.where(eq(assignments.courseId, courseId));

	return assignmentsList;
}

export type FetchAssignmentsReturnType = Awaited<
	ReturnType<typeof fetchAssignments>
>;

export async function fetchAllAssignments(userId: string) {
	const assignmentsList = await db
		.select({
			id: assignments.id,
			title: assignments.title,
			description: assignments.description,
			points: assignments.points,
			dueDate: assignments.dueDate,
			format: assignments.format,
		})
		.from(assignments)
		.innerJoin(registration, eq(assignments.courseId, registration.courseId))
		.where(eq(registration.userId, userId));

	return assignmentsList;
}

export type FetchAllAssignmentsReturnType = Awaited<
	ReturnType<typeof fetchAllAssignments>
>;

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
