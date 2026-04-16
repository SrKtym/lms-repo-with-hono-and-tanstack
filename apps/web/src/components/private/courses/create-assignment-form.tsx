import { assignmentFormat } from "@lms-repo/db/constants";
import { InputForForm } from "@lms-repo/ui/components/input";
import { DefaultSelect } from "@lms-repo/ui/components/select";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";

export function CreateAssignmentForm() {
	const form = useForm({
		defaultValues: {
			title: "",
			description: "",
			points: "",
			dueDate: new Date(),
			format: "text",
		},
		onSubmit: async ({ value }) => {
			// 課題作成のロジックをここに実装
			console.log("課題が作成されました:", value);
		},
		validators: {
			onSubmit: z.object({
				title: z.string().min(1, "課題名は必須です"),
				description: z.string().optional(),
				points: z.coerce
					.number<string>()
					.int("点数は整数で入力してください")
					.min(0, "点数は0以上で入力してください")
					.max(100, "点数は100以下で入力してください"),
				dueDate: z.coerce
					.date()
					.min(new Date(), "締切日は未来の日付を入力してください"),
				format: z.enum(["text", "file"], {
					error: "提出形式を選択してください。",
				}),
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
							}}
							labelProps={{
								htmlFor: field.name,
								children: "課題名",
							}}
						/>
					</div>
				)}
			</form.Field>

			<form.Field name="description">
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
								children: "課題の説明",
							}}
						/>
					</div>
				)}
			</form.Field>

			<form.Field name="points">
				{(field) => (
					<div className="space-y-2">
						<InputForForm
							inputProps={{
								id: field.name,
								name: field.name,
								type: "number",
								min: 0,
								max: 100,
								step: 1,
								value: field.state.value,
								onBlur: field.handleBlur,
								onChange: (e) => field.handleChange(e.target.value),
							}}
							labelProps={{
								htmlFor: field.name,
								children: "点数",
							}}
						/>
					</div>
				)}
			</form.Field>

			<form.Field name="dueDate">
				{(field) => (
					<div className="space-y-2">
						<InputForForm
							inputProps={{
								id: field.name,
								name: field.name,
								type: "date",
								value: field.state.value.toISOString().split("T")[0],
								onBlur: field.handleBlur,
								onChange: (e) => field.handleChange(new Date(e.target.value)),
							}}
							labelProps={{
								htmlFor: field.name,
								children: "締切日",
							}}
						/>
					</div>
				)}
			</form.Field>

			<form.Field name="format">
				{(field) => (
					<div className="space-y-2">
						<DefaultSelect
							value={field.state.value}
							onValueChange={(value) => field.handleChange(value)}
							items={[...assignmentFormat]}
							ariaLabel="select format"
						/>
					</div>
				)}
			</form.Field>
		</form>
	);
}
