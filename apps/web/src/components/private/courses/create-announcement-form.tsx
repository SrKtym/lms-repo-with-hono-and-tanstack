import { InputForForm } from "@lms-repo/ui/components/input";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";

export function CreateAnnouncementForm() {
	const form = useForm({
		defaultValues: {
			title: "",
			description: "",
		},
		onSubmit: async ({ value }) => {
			// お知らせ作成のロジックをここに実装
			console.log("お知らせが作成されました:", value);
		},
		validators: {
			onSubmit: z.object({
				title: z.string().min(1, "タイトルは必須です"),
				description: z
					.string()
					.min(1, "説明は必須です")
					.max(500, "説明は500文字以内で入力してください"),
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
								children: "タイトル",
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
								minLength: 1,
								maxLength: 500,
								value: field.state.value,
								onBlur: field.handleBlur,
								onChange: (e) => field.handleChange(e.target.value),
							}}
							labelProps={{
								htmlFor: field.name,
								children: "説明",
							}}
						/>
					</div>
				)}
			</form.Field>
		</form>
	);
}
