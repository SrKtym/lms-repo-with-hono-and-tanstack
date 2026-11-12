import { announcementType } from "@lms-repo/db/schema/service";
import { z } from "zod";

export const formSchema = z.object({
	title: z.string().min(1, "タイトルは必須です"),
	description: z
		.string()
		.min(1, "説明は必須です")
		.max(500, "説明は500文字以内で入力してください"),
	type: z.string().refine((v) => announcementType.includes(v), {
		error: "不正なアナウンスメント形式です",
	}),
});
