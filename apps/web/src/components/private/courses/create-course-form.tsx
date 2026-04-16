import { InputForForm } from "@lms-repo/ui/components/input";
import { DefaultSelect } from "@lms-repo/ui/components/select";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";

export function CreateCourseForm() {
	const options = ["必修", "選択必修", "任意"] as const;

	const form = useForm({
		defaultValues: {
			name: "",
			targetGrade: "",
			weekdays: "",
			period: "",
			credit: "",
			requirements: "任意",
			classRoom: "",
		},
		onSubmit: async ({ value }) => {
			// コース作成のロジックをここに実装
			console.log("コースが作成されました:", value);
		},
		validators: {
			onSubmit: z.object({
				name: z.string().min(1, "講義名は必須です"),
				targetGrade: z.coerce
					.number<string>()
					.int("対象学年は整数で入力してください")
					.min(1, "対象学年は1から4の間で入力してください")
					.max(4, "対象学年は1から4の間で入力してください"),
				weekdays: z.string().min(1, "曜日は必須です"),
				period: z.coerce
					.number<string>()
					.int("時限は整数で入力してください")
					.min(1, "時限は1から5の間で入力してください")
					.max(5, "時限は1から5の間で入力してください"),
				credit: z.coerce
					.number<string>()
					.int("単位数は整数で入力してください")
					.min(1, "単位数は1から4の間で入力してください")
					.max(4, "単位数は1から4の間で入力してください"),
				requirements: z.enum([...options], {
					error: "履修区分を選択してください。",
				}),
				classRoom: z
					.string()
					.regex(/^L[1-9][0-9]{2}$/, "教室はL101のように入力してください"),
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
			<form.Field name="name">
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
							}}
							labelProps={{
								htmlFor: field.name,
								children: "講義名",
							}}
						/>
						{field.state.meta.errors.map((error) => (
							<p key={error?.message} className="text-red-500">
								{error?.message}
							</p>
						))}
					</div>
				)}
			</form.Field>

			<form.Field name="targetGrade">
				{(field) => (
					<div className="space-y-2">
						<InputForForm
							labelProps={{
								children: "対象学年",
							}}
							inputProps={{
								id: field.name,
								name: field.name,
								type: "number",
								min: 1,
								max: 4,
								step: 1,
								value: field.state.value,
								onBlur: field.handleBlur,
								onChange: (e) => field.handleChange(e.target.value),
							}}
						/>
					</div>
				)}
			</form.Field>

			<form.Field name="weekdays">
				{(field) => (
					<div className="space-y-2">
						<InputForForm
							labelProps={{
								children: "曜日",
							}}
							inputProps={{
								id: field.name,
								name: field.name,
								type: "text",
								value: field.state.value,
								onBlur: field.handleBlur,
								onChange: (e) => field.handleChange(e.target.value),
							}}
						/>
					</div>
				)}
			</form.Field>

			<form.Field name="period">
				{(field) => (
					<div className="space-y-2">
						<InputForForm
							labelProps={{
								children: "時限",
							}}
							inputProps={{
								id: field.name,
								name: field.name,
								type: "number",
								min: 1,
								max: 5,
								step: 1,
								value: field.state.value,
								onBlur: field.handleBlur,
								onChange: (e) => field.handleChange(e.target.value),
							}}
						/>
					</div>
				)}
			</form.Field>

			<form.Field name="credit">
				{(field) => (
					<div className="space-y-2">
						<InputForForm
							labelProps={{
								children: "単位数",
							}}
							inputProps={{
								id: field.name,
								name: field.name,
								type: "number",
								min: 1,
								max: 4,
								step: 1,
								value: field.state.value,
								onBlur: field.handleBlur,
								onChange: (e) => field.handleChange(e.target.value),
							}}
						/>
					</div>
				)}
			</form.Field>

			<form.Field name="requirements">
				{(field) => (
					<div className="space-y-2">
						<DefaultSelect
							value={field.state.value}
							onValueChange={(value) => field.handleChange(value)}
							items={[...options]}
							ariaLabel="select requirements"
						/>
					</div>
				)}
			</form.Field>

			<form.Field name="classRoom">
				{(field) => (
					<div className="space-y-2">
						<InputForForm
							labelProps={{
								children: "教室",
							}}
							inputProps={{
								id: field.name,
								name: field.name,
								type: "text",
								value: field.state.value,
								onBlur: field.handleBlur,
								onChange: (e) => field.handleChange(e.target.value),
							}}
						/>
					</div>
				)}
			</form.Field>
		</form>
	);
}
