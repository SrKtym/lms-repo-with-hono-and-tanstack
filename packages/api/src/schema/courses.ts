import { requirements } from "@lms-repo/db/schema/service";
import { DAYS_EXCEPT_WEEKEND } from "@lms-repo/shared/utils";
import { z } from "zod";

export const formSchema = z.object({
	name: z.string().min(1, "講義名は必須です"),
	targetGrade: z
		.number()
		.int("対象学年は整数で入力してください")
		.min(1, "対象学年は1から4の間で入力してください")
		.max(4, "対象学年は1から4の間で入力してください"),
	weekdays: z.string().refine(
		(v) => {
			const stringArr = DAYS_EXCEPT_WEEKEND.map((day) => day.toString());
			return stringArr.includes(v);
		},
		{
			error: "曜日は月～金のいずれかを指定してください",
		},
	),
	period: z
		.number()
		.int("時限は整数で入力してください")
		.min(1, "時限は1から5の間で入力してください")
		.max(5, "時限は1から5の間で入力してください"),
	credits: z
		.number()
		.int("単位数は整数で入力してください")
		.min(1, "単位数は1から4の間で入力してください")
		.max(4, "単位数は1から4の間で入力してください"),
	requirements: z.enum(requirements, {
		error: "履修区分は必修、選択必修、任意のいずれかを指定してください",
	}),
	classRoom: z.string(),
});

export const courseSearchQuerySchema = z.object({
	weekdays: z.coerce.number(),
	period: z.coerce.number(),
	limit: z.coerce.number(),
	offset: z.coerce.number(),
});
