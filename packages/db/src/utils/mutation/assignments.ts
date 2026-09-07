import { eq } from "drizzle-orm";
import { db } from "../../index";
import { assignments } from "../../schema";
import type { Assignments } from "../../types";
import {
	createNotification,
	fetchCourseData,
	fetchEmailsForNotification,
} from "./helpers";

// 課題の作成
export async function createAssignments(assignmentsData: Assignments) {
	try {
		const result = await db.transaction(async (tx) => {
			// 課題の作成と取得
			const [result] = await tx
				.insert(assignments)
				.values(assignmentsData)
				.returning({
					title: assignments.title,
					description: assignments.description,
					points: assignments.points,
					dueDate: assignments.dueDate,
					format: assignments.format,
					courseId: assignments.courseId,
				})
				.onConflictDoNothing();

			const courseId = result?.courseId;

			if (!courseId) {
				return { error: "講義が見つかりません", status: 404 };
			}

			// 講義名と受講者IDを取得
			const courseData = await fetchCourseData(tx, courseId);

			if (!courseData?.studentId) {
				return {
					error: "受講者がいないため通知を作成できませんでした。",
					status: 404,
				};
			}

			// 通知の作成
			await createNotification(
				tx,
				{
					title: `${courseData.name}に新しい課題: ${result.title}`,
					description: `提出形式: ${result.format}\n説明: ${result.description}`,
					type: "assignment",
				},
				[courseData],
			);

			// メール通知を有効にしているユーザーのメール一覧
			const emails = await fetchEmailsForNotification(
				tx,
				courseId,
				"assignmentsEmail",
			);

			const { courseId: _, ...rest } = result;

			const merged = { ...rest, emails };

			return merged;
		});
		return result;
	} catch {
		return { error: "課題の作成に失敗しました。", status: 500 };
	}
}

// 課題の更新
export async function updateAssignments(assignmentsData: Assignments) {
	try {
		await db.update(assignments).set(assignmentsData);
		return { message: "課題の更新に成功しました。", status: 200 };
	} catch {
		return { error: "課題の更新に失敗しました。", status: 500 };
	}
}

// 課題の削除
export async function deleteAssignments(assignmentId: string) {
	try {
		await db.delete(assignments).where(eq(assignments.id, assignmentId));
		return { message: "課題の削除に成功しました。", status: 200 };
	} catch {
		return { error: "課題の削除に失敗しました。", status: 500 };
	}
}
