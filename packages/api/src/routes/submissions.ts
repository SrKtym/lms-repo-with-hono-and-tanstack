import { Storage } from "@google-cloud/storage";
import { zValidator } from "@hono/zod-validator";
import type { Session } from "@lms-repo/auth/server";
import type { TextSubmissions } from "@lms-repo/db/types";
import {
	createFileSubmissionMetadata,
	createTextSubmission,
	deleteFileSubmissionMetadata,
	updateSubmissionStatus,
} from "@lms-repo/db/utils/mutation/submissions";
import {
	fetchFileMetadataByUserId,
	fetchSubmissionById,
	fetchSubmissionsFromUserCourses,
	fetchTextSubmissionsByUserId,
} from "@lms-repo/db/utils/query/submissions";
import { env } from "@lms-repo/env/server";
import { Hono } from "hono";
import { z } from "zod";

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

// ファイルアップロードの制限
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILE_COUNT = 5;
const ALLOWED_MIME_TYPES = [
	"application/pdf",
	"application/msword",
	"application/vnd.ms-excel",
	"application/vnd.ms-powerpoint",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	"application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

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

// 署名付きURL生成スキーマ
const signedUrlSchema = z
	.array(
		z.object({
			fileName: z.string(),
			fileType: z.string(),
			fileSize: z
				.number()
				.max(MAX_FILE_SIZE, "ファイルサイズは10MB以下である必要があります"),
		}),
	)
	.max(
		MAX_FILE_COUNT,
		`一度にアップロードできるファイルは${MAX_FILE_COUNT}個までです`,
	);

// メタデータスキーマ
const metadataSchema = z.object({
	metadataList: z
		.array(
			z.object({
				objectName: z.string(),
				originalName: z.string(),
				mimeType: z.string(),
				fileSize: z
					.number()
					.max(MAX_FILE_SIZE, "ファイルサイズは10MB以下である必要があります"),
			}),
		)
		.max(
			MAX_FILE_COUNT,
			`一度にアップロードできるファイルは${MAX_FILE_COUNT}個までです`,
		),
	assignmentId: z.string(),
});

export const submissionsRoute = new Hono<{
	Variables: {
		user: Session["user"];
		session: Session["session"];
	};
}>()
	// エミュレータ環境用の直接アップロードエンドポイント
	.post("/upload", async (c) => {
		const formData = await c.req.formData();
		const file = formData.get("file") as File;
		const fileName = formData.get("fileName") as string;

		if (!file || !fileName) {
			return c.json({ error: "Missing file or fileName" }, 400);
		}

		// バケットが存在することを確認
		await ensureBucketExists();

		// エミュレータ環境ではストレージクライアントを使用して直接アップロード
		const fileObject = bucket.file(`uploads/${fileName}`);
		const buffer = Buffer.from(await file.arrayBuffer());
		await fileObject.save(buffer, {
			contentType: file.type,
		});

		return c.json({
			objectName: `uploads/${fileName}`,
			originalName: fileName,
			mimeType: file.type,
			fileSize: file.size,
		});
	})
	// 署名付きURLの一括発行（複数ファイルアップロード用）
	.post("/signed_urls", zValidator("json", signedUrlSchema), async (c) => {
		const files = c.req.valid("json");

		// MIMEタイプの検証
		for (const file of files) {
			if (!ALLOWED_MIME_TYPES.includes(file.fileType)) {
				return c.json(
					{
						error: `許可されていないファイルタイプです: ${file.fileType}`,
						allowedTypes: ALLOWED_MIME_TYPES,
					},
					400,
				);
			}
		}

		// バケットが存在することを確認
		await ensureBucketExists();

		const signedUrls = await Promise.all(
			files.map(async ({ fileName, fileType }) => {
				let signedUrl: string;

				// エミュレータ環境では署名なしURLを使用
				if (env.GCS_EMULATOR_HOST) {
					const gcsHost = env.GCS_EMULATOR_HOST.replace(
						"fake-gcs",
						"localhost",
					);
					signedUrl = `${gcsHost}/${env.GCS_BUCKET_NAME}/uploads/${fileName}`;
				} else {
					// 本番環境では署名付きURLを使用
					[signedUrl] = await bucket.file(`uploads/${fileName}`).getSignedUrl({
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

		return c.json(signedUrls);
	})
	// ファイルメタデータの一括保存（複数ファイルアップロード用）
	.post("/metadata", zValidator("json", metadataSchema), async (c) => {
		const { userId } = c.get("session");
		const { metadataList, assignmentId } = c.req.valid("json");

		// MIMEタイプの検証
		for (const metadata of metadataList) {
			if (!ALLOWED_MIME_TYPES.includes(metadata.mimeType)) {
				return c.json(
					{
						error: `許可されていないファイルタイプです: ${metadata.mimeType}`,
						allowedTypes: ALLOWED_MIME_TYPES,
					},
					400,
				);
			}
		}

		// メタデータを一括保存
		const results = await Promise.all(
			metadataList.map(async (metadata) => {
				const result = await createFileSubmissionMetadata({
					assignmentId,
					bucket: env.GCS_BUCKET_NAME,
					...metadata,
					createdBy: userId,
				});
				return result;
			}),
		);

		// 提出状況を更新
		const updateResult = await updateSubmissionStatus(
			assignmentId,
			userId,
			"提出済み",
		);

		if (updateResult.status !== 200) {
			return c.json(updateResult);
		}

		return c.json({ successCount: results.length, results }, 201);
	})
	// 課題の提出（テキスト形式）
	.post(
		"/text",
		zValidator("json", z.custom<Omit<TextSubmissions, "createdBy">>()),
		async (c) => {
			const { userId } = c.get("session");
			const { assignmentId, title, description } = c.req.valid("json");

			const result = await createTextSubmission({
				assignmentId,
				title,
				description,
				createdBy: userId,
			});
			return c.json(result, 201);
		},
	)
	// 課題提出状況の取得
	.get("/", async (c) => {
		const { userId } = c.get("session");
		const submissions = await fetchSubmissionsFromUserCourses(userId);
		return c.json(submissions, 200);
	})
	// ファイルメタデータの取得
	.get("/files/:assignmentId", async (c) => {
		const { userId } = c.get("session");
		const assignmentId = c.req.param("assignmentId");
		const fileMetadata = await fetchFileMetadataByUserId(userId, assignmentId);
		return c.json(fileMetadata, 200);
	})
	// テキスト提出の取得
	.get("/text/:assignmentId", async (c) => {
		const { userId } = c.get("session");
		const assignmentId = c.req.param("assignmentId");
		const textSubmissionsData = await fetchTextSubmissionsByUserId(
			userId,
			assignmentId,
		);
		return c.json(textSubmissionsData, 200);
	})
	// 特定の課題提出状況の取得
	.get("/:assignmentId", async (c) => {
		const { userId } = c.get("session");
		const assignmentId = c.req.param("assignmentId");
		const submission = await fetchSubmissionById(userId, assignmentId);
		return c.json(submission, 200);
	})
	// ファイルダウンロード用署名付きURLの発行
	.get("/files/:id/download", async (c) => {
		const { userId } = c.get("session");
		const id = c.req.param("id");

		const fileMetadata = await fetchFileMetadataByUserId(userId);
		const file = fileMetadata?.find((f) => f.id === id);

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
		const id = c.req.param("id");

		const fileMetadata = await fetchFileMetadataByUserId(userId);
		const file = fileMetadata?.find((f) => f.id === id);

		if (!file) {
			return c.json({ error: "ファイルが見つかりません" }, 404);
		}

		// GCSからファイルを取得
		const [fileData] = await bucket.file(file.objectName).download();

		return c.newResponse(new Uint8Array(fileData), 200, {
			"Content-Type": file.mimeType,
			"Content-Disposition": `attachment; filename="${file.originalName}"`,
		});
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

		// データベースからメタデータを削除
		const deleteResult = await deleteFileSubmissionMetadata(id);

		if (deleteResult.status !== 200) {
			return c.json(deleteResult, 500);
		}

		return c.json({ message: "ファイルを削除しました" }, 200);
	});
