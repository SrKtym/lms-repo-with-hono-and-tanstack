import { eq } from "drizzle-orm";
import { db } from "../../index";
import {
	fileSubmissionsMetadata,
	submissionStatus,
	textSubmissions,
} from "../../schema/service";
import type { FileSubmissionsMetadata, TextSubmissions } from "../../types";

// テキスト形式の提出
export const createTextSubmission = async (submission: TextSubmissions) => {
	try {
		await db
			.insert(textSubmissions)
			.values(submission)
			.onConflictDoUpdate({
				target: [textSubmissions.assignmentId, textSubmissions.createdBy],
				set: {
					title: submission.title,
					description: submission.description,
				},
			});
		return { message: "テキスト提出に成功しました", status: 200 };
	} catch {
		return { error: "テキスト提出に失敗しました", status: 500 };
	}
};

// ファイル形式の提出メタデータ作成
export const createFileSubmissionMetadata = async (
	submissionMetadata: FileSubmissionsMetadata,
) => {
	try {
		const [result] = await db
			.insert(fileSubmissionsMetadata)
			.values(submissionMetadata)
			.returning({
				id: fileSubmissionsMetadata.id,
				bucket: fileSubmissionsMetadata.bucket,
				objectName: fileSubmissionsMetadata.objectName,
				originalName: fileSubmissionsMetadata.originalName,
				mimeType: fileSubmissionsMetadata.mimeType,
				fileSize: fileSubmissionsMetadata.fileSize,
			});
		return result;
	} catch {
		return { error: "ファイルメタデータの作成に失敗しました", status: 500 };
	}
};

// 提出状況の更新
export const updateSubmissionStatus = async (
	assignmentId: string,
	userId: string,
	status: "未提出" | "提出済み",
) => {
	try {
		await db
			.insert(submissionStatus)
			.values({
				assignmentId,
				userId,
				status,
			})
			.onConflictDoUpdate({
				target: [submissionStatus.assignmentId, submissionStatus.userId],
				set: { status },
			});
		return { message: "提出状況の更新に成功しました", status: 200 };
	} catch {
		return { error: "提出状況の更新に失敗しました", status: 500 };
	}
};

// 採点（スコアとステータスの更新）
export const updateSubmissionScore = async (
	assignmentId: string,
	userId: string,
	score: number,
) => {
	try {
		await db
			.insert(submissionStatus)
			.values({
				assignmentId,
				userId,
				score,
				status: "評定済み",
			})
			.onConflictDoUpdate({
				target: [submissionStatus.assignmentId, submissionStatus.userId],
				set: { score, status: "評定済み" },
			});
		return { message: "採点に成功しました", status: 200 };
	} catch {
		return { error: "採点に失敗しました", status: 500 };
	}
};

// ファイルメタデータの削除
export const deleteFileSubmissionMetadata = async (id: string) => {
	try {
		await db
			.delete(fileSubmissionsMetadata)
			.where(eq(fileSubmissionsMetadata.id, id));
		return { message: "ファイルメタデータの削除に成功しました", status: 200 };
	} catch {
		return { error: "ファイルメタデータの削除に失敗しました", status: 500 };
	}
};

// テキスト提出物の削除
export const deleteTextSubmission = async (id: string) => {
	try {
		await db.delete(textSubmissions).where(eq(textSubmissions.id, id));
		return { message: "テキスト提出物の削除に成功しました", status: 200 };
	} catch {
		return { error: "テキスト提出物の削除に失敗しました", status: 500 };
	}
};
