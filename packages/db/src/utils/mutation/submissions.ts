import { eq } from "drizzle-orm";
import { db } from "../../index";
import {
	fileSubmissionsMetadata,
	submissionStatus,
	textSubmissions,
} from "../../schema/service";
import type {
	FileSubmissionsMetadata,
	FileSubmissionsMetadataOptional,
	TextSubmissions,
} from "../../types";
import { fail, ok, syncSubmissionStatusAfterDeletion } from "./helpers";

// ファイルメタデータの一括登録と提出状況の更新
export async function submitFilesWithStatus(
	assignmentId: string,
	userId: string,
	bucket: string,
	metadataList: Omit<
		FileSubmissionsMetadata,
		FileSubmissionsMetadataOptional
	>[],
) {
	const values = metadataList.map((metadata) => ({
		assignmentId,
		createdBy: userId,
		bucket,
		...metadata,
	}));

	try {
		const result = await db.transaction(async (tx) => {
			// 1. メタデータを一括 INSERT
			const inserted = await tx
				.insert(fileSubmissionsMetadata)
				.values(values)
				.returning({
					id: fileSubmissionsMetadata.id,
					objectName: fileSubmissionsMetadata.objectName,
					originalName: fileSubmissionsMetadata.originalName,
					mimeType: fileSubmissionsMetadata.mimeType,
					fileSize: fileSubmissionsMetadata.fileSize,
				});

			// 2. 提出状況を「提出済み」に更新
			await tx
				.insert(submissionStatus)
				.values({
					assignmentId,
					userId,
					status: "提出済み",
				})
				.onConflictDoUpdate({
					target: [submissionStatus.assignmentId, submissionStatus.userId],
					set: { status: "提出済み" },
				});

			return inserted;
		});

		return result;
	} catch {
		return fail("ファイル提出処理に失敗しました", 500);
	}
}

// テキスト形式物の保存と提出状況の更新
export async function submitTextWithStatus(submission: TextSubmissions) {
	try {
		await db.transaction(async (tx) => {
			// 1. テキスト提出を保存
			await tx
				.insert(textSubmissions)
				.values(submission)
				.onConflictDoUpdate({
					target: [textSubmissions.assignmentId, textSubmissions.createdBy],
					set: {
						title: submission.title,
						description: submission.description,
					},
				});

			// 2. 提出状況を更新
			await tx
				.insert(submissionStatus)
				.values({
					assignmentId: submission.assignmentId,
					userId: submission.createdBy,
					status: "提出済み",
				})
				.onConflictDoUpdate({
					target: [submissionStatus.assignmentId, submissionStatus.userId],
					set: { status: "提出済み" },
				});
		});

		return ok("テキスト提出に成功しました", 201);
	} catch {
		return fail("テキスト提出に失敗しました", 500);
	}
}

// ファイル削除と残存確認と提出状況の更新
export async function deleteFileAndSyncStatus(
	fileId: string,
	userId: string,
	assignmentId: string,
) {
	try {
		await db.transaction(async (tx) => {
			// 1. ファイルメタデータを削除
			await tx
				.delete(fileSubmissionsMetadata)
				.where(eq(fileSubmissionsMetadata.id, fileId));

			// 2. 残存確認とステータス同期
			await syncSubmissionStatusAfterDeletion(tx, userId, assignmentId);
		});

		return ok("ファイルメタデータの削除に成功しました", 200);
	} catch {
		return fail("ファイルの削除処理に失敗しました", 500);
	}
}

// テキスト提出物の削除と提出状況の更新
export async function deleteTextAndSyncStatus(
	textSubmissionId: string,
	userId: string,
	assignmentId: string,
) {
	try {
		await db.transaction(async (tx) => {
			// 1. テキスト提出物を削除
			await tx
				.delete(textSubmissions)
				.where(eq(textSubmissions.id, textSubmissionId));
			// 2. 残存確認とステータス同期
			await syncSubmissionStatusAfterDeletion(tx, userId, assignmentId);
		});

		return ok("テキスト提出物の削除に成功しました", 200);
	} catch {
		return fail("テキスト提出物の削除処理に失敗しました", 500);
	}
}

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
		return ok("採点に成功しました", 200);
	} catch {
		return fail("採点に失敗しました", 500);
	}
};

// テキスト提出物の削除
export const deleteTextSubmission = async (id: string) => {
	try {
		await db.delete(textSubmissions).where(eq(textSubmissions.id, id));
		return ok("テキスト提出物の削除に成功しました", 200);
	} catch {
		return fail("テキスト提出物の削除に失敗しました", 500);
	}
};
