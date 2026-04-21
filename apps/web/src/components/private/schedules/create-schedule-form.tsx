import { InputForForm } from "@lms-repo/ui/components/input";
import { ColorSwatchPicker } from "@lms-repo/ui/components/color-swatch-picker";
import {
	getLocalTimeZone,
	now,
	parseColor,
	type ZonedDateTime,
} from "@lms-repo/ui/lib/utils";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";

export function CreateScheduleForm() {
	const dateTime = now(getLocalTimeZone());
	const form = useForm({
		defaultValues: {
			title: "",
			description: "",
			timeSpan: { start: dateTime, end: dateTime },
			theme: "#3B82F6",
		},
		onSubmit: async ({ value }) => {
			// スケジュール作成のロジックをここに実装
			console.log("スケジュールが作成されました:", value);
		},
		validators: {
			onSubmit: z.object({
				title: z
					.string()
					.transform((value) => (value === "" ? "タイトルなし" : value)),
				description: z.string().min(1, "説明は必須です"),
				timeSpan: z
					.object({
						start: z
							.custom<ZonedDateTime>()
							.transform((value) => value.toDate())
							.refine((value) => new Date() < value, {
								error: "過去の日時は選択できません。",
								path: ["start"],
							}),
						end: z.custom<ZonedDateTime>().transform((value) => value.toDate()),
					})
					.refine((value) => value.end > value.start, {
						error: "開始日時は終了日時よりも前でなければなりません。",
						path: ["start"],
					}),
				theme: z
					.string()
					.regex(/^#[0-9a-f]{6}$/i, "有効なカラーコードを入力してください")
					.transform((value) => parseColor(value)),
			}),
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation;
				form.handleSubmit();
			}}
			className="form-field"
		>
			<form.Field name="title">
				{(field) => (
					<div className="space-y-2">
						<InputForForm
							inputProps={{
								id: field.name,
								name: field.name,
								type: "text",
								value: field.state.value,
								onBlur: field.handleBlur,
								onChange: (e) => field.handleChange(e.target.value),
								placeholder: "タイトルを入力",
							}}
							labelProps={{
								htmlFor: field.name,
								children: "タイトル",
								className:
									"text-gray-700 text-sm font-medium dark:text-gray-300",
							}}
							isRequired={false}
						/>
						{field.state.meta.errors.map((error) => (
							<p key={error?.message} className="text-red-500">
								{error?.message}
							</p>
						))}
					</div>
				)}
			</form.Field>

			<form.Field name="description">
				{(field) => (
					<div className="space-y-2">
						<InputForForm
							labelProps={{
								children: "説明",
								className:
									"text-gray-700 text-sm font-medium dark:text-gray-300",
							}}
							textAreaProps={{
								id: field.name,
								name: field.name,
								value: field.state.value,
								onBlur: field.handleBlur,
								onChange: (e) => field.handleChange(e.target.value),
								placeholder: "説明を入力",
								rows: 3,
							}}
							isRequired={false}
						/>
						{field.state.meta.errors.map((error) => (
							<p key={error?.message} className="text-red-500">
								{error?.message}
							</p>
						))}
					</div>
				)}
			</form.Field>
			<form.Field name="timeSpan">
				{(field) => (
					<div className="space-y-2">
						<InputForForm
							labelProps={{
								children: "期間",
							}}
							dateRangePickerProps={{
								defaultValue: {
									start: field.state.value?.start,
									end: field.state.value?.end,
								},
								onChange: (value) => {
									if (value) {
										field.handleChange({ start: value.start, end: value.end });
									}
								},
							}}
							isRequired={true}
						/>
					</div>
				)}
			</form.Field>
			<form.Field name="theme">
				{(field) => (
					<div className="space-y-2">
						<ColorSwatchPicker
							value={field.state.value}
							onChange={(color) => field.handleChange(color.toString())}
						/>
						{field.state.meta.errors.map((error) => (
							<p key={error?.message} className="text-red-500">
								{error?.message}
							</p>
						))}
					</div>
				)}
			</form.Field>
		</form>
	);
}
