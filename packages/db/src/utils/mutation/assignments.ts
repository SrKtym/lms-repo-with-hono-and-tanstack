import { eq } from "drizzle-orm";
import { db } from "../../index";
import { assignments } from "../../schema";
import type { Assignments } from "../../types";

export async function createAssignments(assignmentsData: Assignments) {
	try {
		await db.insert(assignments).values(assignmentsData);
		return { message: "課題の作成に成功しました。", status: 201 };
	} catch {
		return { message: "課題の作成に失敗しました。", status: 500 };
	}
}

export async function updateAssignments(assignmentsData: Assignments) {
	try {
		await db.update(assignments).set(assignmentsData);
		return { message: "課題の更新に成功しました。", status: 200 };
	} catch {
		return { message: "課題の更新に失敗しました。", status: 500 };
	}
}

export async function deleteAssignments(assignmentId: string) {
	try {
		await db.delete(assignments).where(eq(assignments.id, assignmentId));
		return { message: "課題の削除に成功しました。", status: 200 };
	} catch {
		return { message: "課題の削除に失敗しました。", status: 500 };
	}
}
