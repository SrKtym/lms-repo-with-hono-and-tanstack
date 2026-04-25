import { eq } from "drizzle-orm";
import { db } from "../../index";
import { assignments } from "../../schema";

export async function fetchAssignments() {
	const assignmentsList = await db
		.select()
		.from(assignments);
	return assignmentsList;
}

export type FetchAssignmentsReturnType = Awaited<
	ReturnType<typeof fetchAssignments>
>;

export async function fetchAssignmentById(assignmentId: string) {
	const assignment = await db
		.select()
		.from(assignments)
		.where(eq(assignments.id, assignmentId));
	return assignment;
}
