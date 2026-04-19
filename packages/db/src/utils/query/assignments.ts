import { eq } from "drizzle-orm";
import { db } from "../../index";
import { assignments } from "../../schema";

export async function fetchAssignments(assignmentsId?: string) {
	const assignmentsList = await db
		.select()
		.from(assignments)
		.where(assignmentsId ? eq(assignments.id, assignmentsId) : undefined);
	return assignmentsList;
}

export type FetchAssignmentsReturnType = Awaited<
	ReturnType<typeof fetchAssignments>
>;
