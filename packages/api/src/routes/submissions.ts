import { Storage } from "@google-cloud/storage";
import { zValidator } from "@hono/zod-validator";
import type { Session } from "@lms-repo/auth/server";

import {
	deleteFileAndSyncStatus,
	deleteTextAndSyncStatus,
	submitFilesWithStatus,
	submitTextWithStatus,
	updateSubmissionScore,
} from "@lms-repo/db/utils/mutation/submissions";
import { fetchAssignmentPointsById } from "@lms-repo/db/utils/query/assignments";
import {
	type FetchFileMetadataByIdReturnType,
	type FetchFileMetadataByUserIdReturnType,
	fetchAllSubmissionsWithStudents,
	fetchFileMetadataById,
	fetchFileMetadataByUserId,
	fetchSubmissionsState,
	fetchTextSubmissionsByUserId,
} from "@lms-repo/db/utils/query/submissions";
import { env } from "@lms-repo/env/server";
import { Hono } from "hono";
import { z } from "zod";
import {
	metadataSchema,
	signedUrlSchema,
	textSubmissionsSchema,
} from "../schema/submissions";

const storage = new Storage({
	// エミュレータ環境の場合のみAPIエンドポイントを設定
	...(env.GCS_EMULATOR_HOST && {
		apiEndpoint: env.GCS_EMULATOR_HOST,
		projectId: "dummy-project",
		credentials: {
			client_email: "dummy@example.com",
			private_key:
				"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7WJT1m8tY4z\n-----END PRIVATE KEY-----",
		},
	}),
});

const bucket = storage.bucket(env.GCS_BUCKET_NAME);

type FileMetadata =
	| FetchFileMetadataByIdReturnType
	| FetchFileMetadataByUserIdReturnType[number];

// エミュレータ環境でバケットが存在しない場合は作成
async function ensureBucketExists() {
	if (env.GCS_EMULATOR_HOST) {
		const [exists] = await bucket.exists();
		if (!exists) {
			await bucket.create();
			console.log(`Bucket ${env.GCS_BUCKET_NAME} created`);
		}
	}
}

// 提出に関するロジック（学生用）
export const submissionsRouteForStudent = new Hono<{
	Variables: {
		user: Session["user"];
		session: Session["session"];
	};
}>()
	// エミュレータ環境用の直接アップロードエンドポイント
	.post(
		"/:assignment-id/upload",
		zValidator(
			"form",
			z.object({
				files: z.array(z.file()).or(z.file()),
			}),
		),
		async (c) => {
			const { files } = c.req.valid("form");

			// 単一ファイルでも配列に正規化
			const fileList = Array.isArray(files) ? files : [files];
			if (fileList.length === 0) {
				return c.json({ error: "ファイルが見つかりません" }, 404);
			}

			// バケットが存在することを確認
			await ensureBucketExists();

			// エミュレータ環境のストレージに並列でアップロード
			const uploadedMetadata = await Promise.all(
				fileList.map(async (file) => {
					const fileName = file.name;
					const fileObject = bucket.file(`uploads/${fileName}`);
					const buffer = Buffer.from(await file.arrayBuffer());
					await fileObject.save(buffer, {
						contentType: file.type,
					});
					return {
						objectName: `uploads/${fileName}`,
						originalName: fileName,
						mimeType: file.type,
						fileSize: file.size,
					};
				}),
			);
			// メタデータの配列を返す
			return c.json(uploadedMetadata, 200);
		},
	)
	// ファイルメタデータの一括保存（複数ファイルアップロード用）
	.post(
		"/:assignment-id/files",
		zValidator("json", metadataSchema, (result, c) => {
			if (!result.success) {
				const firstError = result.error.issues[0]?.message;
				return c.json({ error: firstError }, 400);
			}
		}),
		async (c) => {
			const { userId } = c.get("session");
			const { "assignment-id": assignmentId } = c.req.param();
			const { metadataList } = c.req.valid("json");

			// トランザクション処理（メタデータ登録 + ステータス更新）
			const result = await submitFilesWithStatus(
				assignmentId,
				userId,
				env.GCS_BUCKET_NAME,
				metadataList,
			);

			if ("error" in result) {
				const { status, ...body } = result;
				return c.json(body, status);
			}

			return c.json(result, 200);
		},
	)
	// 課題の提出（テキスト形式）
	.post(
		"/:assignment-id/text",
		zValidator("json", textSubmissionsSchema, (result, c) => {
			if (!result.success) {
				const firstError = result.error.issues[0]?.message;
				return c.json({ error: firstError }, 400);
			}
		}),
		async (c) => {
			const { userId } = c.get("session");
			const { "assignment-id": assignmentId } = c.req.param();
			const req = c.req.valid("json");

			const merged = { createdBy: userId, assignmentId, ...req };

			// トランザクション処理（テキスト提出 + ステータス更新）
			const { status, ...body } = await submitTextWithStatus(merged);

			return c.json(body, status);
		},
	)
	// 特定の課題の提出状況の取得
	.get("/:assignment-id/status", async (c) => {
		const { userId } = c.get("session");
		const { "assignment-id": assignmentId } = c.req.param();
		const submissions = await fetchSubmissionsState(userId, assignmentId);
		return c.json(submissions, 200);
	})
	// すべての課題の提出状況の取得
	.get("/status", async (c) => {
		const { userId } = c.get("session");
		const submissions = await fetchSubmissionsState(userId);
		return c.json(submissions, 200);
	})
	// ファイルの削除
	.delete("/files/:id", async (c) => {
		const { userId } = c.get("session");
		const id = c.req.param("id");

		// メタデータを取得してobjectNameを確認
		const fileMetadata = await fetchFileMetadataByUserId(userId);
		const file = fileMetadata?.find((f) => f.id === id);

		if (!file) {
			return c.json({ error: "ファイルが見つかりません" }, 404);
		}

		// GCSからファイルを削除
		try {
			await bucket.file(file.objectName).delete();
		} catch (error) {
			console.error("GCSファイル削除エラー:", error);
			// GCS削除に失敗してもDB削除は続行
		}

		const { status, ...body } = await deleteFileAndSyncStatus(
			file.id,
			userId,
			file.assignmentId,
		);

		return c.json(body, status);
	})
	// テキスト提出物の削除
	.delete("/text/:id", async (c) => {
		const { userId } = c.get("session");
		const id = c.req.param("id");

		// ユーザーが所有するテキスト提出物か確認
		const textSubmissionsData = await fetchTextSubmissionsByUserId(userId);
		const submission = textSubmissionsData?.find((s) => s.id === id);

		if (!submission) {
			return c.json({ error: "テキスト提出物が見つかりません" }, 404);
		}

		const { status, ...body } = await deleteTextAndSyncStatus(
			submission.id,
			userId,
			submission.assignmentId,
		);

		return c.json(body, 200);
	});

// 提出に関するロジック（教員用）
export const submissionsRouteForProf = new Hono<{
	Variables: {
		user: Session["user"];
		session: Session["session"];
	};
}>() // 採点（教員用）
	.post(
		"/:assignment-id/grade",
		zValidator(
			"json",
			z.object({
				userId: z.uuidv4(),
				score: z.number(),
			}),
		),
		async (c) => {
			const { "assignment-id": assignmentId } = c.req.param();
			const { userId, score } = c.req.valid("json");

			const assignmentPoints = await fetchAssignmentPointsById(assignmentId);

			if (!assignmentPoints) {
				return c.json({ error: "課題が見つかりません" }, 404);
			}

			if (score > assignmentPoints) {
				return c.json({ error: "点数が課題の配点を超えています" }, 400);
			}

			const { status, ...body } = await updateSubmissionScore(
				assignmentId,
				userId,
				score,
			);

			return c.json(body, status);
		},
	) // 指定された課題のすべての提出物を取得（教員用、無限スクロールに対応）
	.get(
		"/:assignment-id",
		zValidator(
			"query",
			z.object({
				limit: z.coerce.number(),
				offset: z.coerce.number(),
			}),
		),
		async (c) => {
			const { "assignment-id": assignmentId } = c.req.param();
			const { limit, offset } = c.req.valid("query");

			const submissions = await fetchAllSubmissionsWithStudents(
				assignmentId,
				limit,
				offset,
			);
			return c.json(submissions, 200);
		},
	);

// 提出に関するロジック(共通)
export const submissionsRouteForCommon = new Hono<{
	Variables: {
		user: Session["user"];
		session: Session["session"];
	};
}>()
	// 署名付きURLの一括発行（ファイルアップロード・ダウンロード用）
	.post(
		"/signed-urls",
		zValidator("json", signedUrlSchema, (result, c) => {
			if (!result.success) {
				const firstError = result.error.issues[0]?.message;
				return c.json({ error: firstError }, 400);
			}
		}),
		async (c) => {
			const files = c.req.valid("json");

			// バケットが存在することを確認
			await ensureBucketExists();

			const signedUrls = await Promise.all(
				files.map(async ({ fileName, fileType }) => {
					let signedUrl: string;

					// エミュレータ環境では署名なしURLを使用
					if (env.GCS_EMULATOR_HOST) {
						signedUrl = `${env.GCS_EMULATOR_HOST}/${env.GCS_BUCKET_NAME}/uploads/${fileName}`;
					} else {
						// 本番環境では署名付きURLを使用
						[signedUrl] = await bucket
							.file(`uploads/${fileName}`)
							.getSignedUrl({
								version: "v4",
								action: "write",
								expires: Date.now() + 15 * 60 * 1000,
								contentType: fileType,
							});
					}

					return {
						fileName,
						signedUrl,
						objectName: `uploads/${fileName}`,
					};
				}),
			);

			return c.json(signedUrls, 200);
		},
	)
	// ファイルメタデータの取得
	.get("/:assignment-id/files", async (c) => {
		const { userId } = c.get("session");
		const { "assignment-id": assignmentId } = c.req.param();

		const fileMetadata = await fetchFileMetadataByUserId(userId, assignmentId);
		return c.json(fileMetadata, 200);
	})
	// テキスト提出物の取得
	.get("/:assignment-id/text", async (c) => {
		const { userId } = c.get("session");
		const { "assignment-id": assignmentId } = c.req.param();

		const textSubmissionsData = await fetchTextSubmissionsByUserId(
			userId,
			assignmentId,
		);
		return c.json(textSubmissionsData, 200);
	})
	// ファイルダウンロード用署名付きURLの発行
	.get("/files/:id/download", async (c) => {
		const { userId } = c.get("session");
		const { role } = c.get("user");
		const id = c.req.param("id");

		let file: FileMetadata;

		if (role === "professor" || role === "admin") {
			// 教員はすべてのファイルメタデータにアクセス可能
			file = await fetchFileMetadataById(id);
		} else {
			// 学生は自分のファイルのみアクセス可能
			const fileMetadata = await fetchFileMetadataByUserId(userId);
			file = fileMetadata?.find((f) => f.id === id);
		}

		if (!file) {
			return c.json({ error: "ファイルが見つかりません" }, 404);
		}

		// エミュレータ環境ではプロキシURLを返す
		if (env.GCS_EMULATOR_HOST) {
			return c.json(
				{
					signedUrl: `/api/submissions/files/${id}/proxy`,
					fileName: file.originalName,
				},
				200,
			);
		}

		// 本番環境では署名付きURLを返す
		const [signedUrl] = await bucket.file(file.objectName).getSignedUrl({
			version: "v4",
			action: "read",
			expires: Date.now() + 15 * 60 * 1000, // 15分有効
		});

		return c.json({ signedUrl, fileName: file.originalName }, 200);
	})
	// ファイルダウンロードプロキシ（エミュレータ環境用）
	.get("/files/:id/proxy", async (c) => {
		const { userId } = c.get("session");
		const { role } = c.get("user");
		const id = c.req.param("id");

		let file: FileMetadata;

		if (role === "professor") {
			// 教員はすべてのファイルメタデータにアクセス可能
			file = await fetchFileMetadataById(id);
		} else {
			// 学生は自分のファイルのみアクセス可能
			const fileMetadata = await fetchFileMetadataByUserId(userId);
			file = fileMetadata?.find((f) => f.id === id);
		}

		if (!file) {
			return c.json({ error: "ファイルが見つかりません" }, 404);
		}

		// GCSからファイルを取得
		const [fileData] = await bucket.file(file.objectName).download();

		return c.newResponse(new Uint8Array(fileData), 200, {
			"Content-Type": file.mimeType,
			"Content-Disposition": `attachment; filename="${file.originalName}"`,
		});
	});
