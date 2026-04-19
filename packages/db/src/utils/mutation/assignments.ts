import { db } from "../../index";
import { assignments } from "../../schema";
import type { Assignments } from "../../types";

export async function createAssignments(assignmentsData: Assignments) {
	const assignmentsList = await db.insert(assignments).values(assignmentsData);
	return assignmentsList;
}
