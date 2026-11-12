import { z } from "zod";

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

// 署名付きURL生成スキーマ
export const signedUrlSchema = z
	.array(
		z.object({
			fileName: z.string(),
			fileType: z.string().refine((v) => ALLOWED_MIME_TYPES.includes(v), {
				error: ({ input }) => `許可されていないファイルタイプです: ${input}`,
			}),
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
export const metadataSchema = z.object({
	metadataList: z
		.array(
			z.object({
				objectName: z.string(),
				originalName: z.string(),
				mimeType: z.string().refine((v) => ALLOWED_MIME_TYPES.includes(v), {
					error: ({ input }) => `許可されていないファイルタイプです: ${input}`,
				}),
				fileSize: z
					.number()
					.max(MAX_FILE_SIZE, "ファイルサイズは10MB以下である必要があります"),
			}),
		)
		.max(
			MAX_FILE_COUNT,
			`一度にアップロードできるファイルは${MAX_FILE_COUNT}個までです`,
		),
});

// テキスト提出物スキーマ
export const textSubmissionsSchema = z.object({
	title: z
		.string()
		.min(1, "タイトルは必須です")
		.max(100, "タイトルは100文字以内で入力してください"),
	description: z
		.string()
		.min(1, "説明は必須です")
		.max(2000, "説明は2000文字以内で入力してください"),
});
