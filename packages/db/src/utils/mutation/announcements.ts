import { eq } from "drizzle-orm";
import { db } from "../../index";
import { announcements } from "../../schema";
import type { Announcements } from "../../types";
import {
	createNotification,
	fetchCourseData,
	fetchEmailsForNotification,
} from "./helpers";

// アナウンスメント作成
export async function createAnnouncements(announcementsData: Announcements) {
	try {
		const result = await db.transaction(async (tx) => {
			// アナウンスメントの作成と取得
			const [result] = await tx
				.insert(announcements)
				.values(announcementsData)
				.returning({
					title: announcements.title,
					description: announcements.description,
					type: announcements.type,
					courseId: announcements.courseId,
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
					title: `${courseData.name}に新しいお知らせ: ${result.title}`,
					description: `${result.type}: ${result.description}`,
					type: "announcement",
				},
				[courseData],
			);

			// メール通知を有効にしているユーザーのメール一覧
			const emails = await fetchEmailsForNotification(
				tx,
				courseId,
				"announcementsEmail",
			);

			const { courseId: _, ...rest } = result;

			const merged = { ...rest, emails };

			return merged;
		});
		return result;
	} catch {
		return {
			error: "アナウンスメントの作成に失敗しました。",
			status: 500,
		};
	}
}

// アナウンスメント更新
export async function updateAnnouncements(announcementsData: Announcements) {
	try {
		await db.update(announcements).set(announcementsData);
		return { message: "アナウンスメントの更新に成功しました。", status: 200 };
	} catch {
		return { error: "アナウンスメントの更新に失敗しました。", status: 500 };
	}
}

// アナウンスメント削除
export async function deleteAnnouncements(id: string) {
	try {
		await db.delete(announcements).where(eq(announcements.id, id));
		return { message: "アナウンスメントの削除に成功しました。", status: 200 };
	} catch {
		return { error: "アナウンスメントの削除に失敗しました。", status: 500 };
	}
}
