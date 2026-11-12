import { assignmentFormat } from "@lms-repo/db/schema/service";
import { z } from "zod";

export const formSchema = z.object({
	title: z.string().min(1, "課題名は必須です"),
	description: z
		.string()
		.min(1, "説明は必須です")
		.max(500, "説明は500文字以内で入力してください"),
	points: z
		.number()
		.int("点数は整数で入力してください")
		.min(0, "点数は0以上で入力してください")
		.max(100, "点数は100以下で入力してください"),
	dueDate: z.coerce
		.date()
		.min(new Date(), "締切日は未来の日付を入力してください"),
	format: z.string().refine((v) => assignmentFormat.includes(v), {
		error: "不正なファイル形式です",
	}),
});
