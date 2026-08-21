import { DefaultButton } from "@lms-repo/ui/components/button";
import { InputForForm } from "@lms-repo/ui/components/input";
import { getDepartmentName } from "@lms-repo/ui/lib/utils";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { useRegisterProfData } from "@/hooks/professors";

export function CreateProfDataForm() {
	const departments = getDepartmentName();

	const { mutateAsync: registerProfData } = useRegisterProfData();

	const form = useForm({
		defaultValues: {
			departmentName: "",
		},
		onSubmit: async ({ value }) => {
			await registerProfData(value);
			location.reload();
		},
		validators: {
			onSubmit: z.object({
				departmentName: z.string(),
			}),
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="form-field p-1"
		>
			<form.Field name="departmentName">
				{(field) => (
					<div className="space-y-2">
						<InputForForm
							selectProps={{
								value: field.state.value,
								onChange: (value) => {
									if (typeof value === "string") {
										field.handleChange(value);
									}
								},
								items: departments,
								ariaLabel: "select department",
							}}
							labelProps={{
								htmlFor: field.name,
								children: "学科",
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
			<form.Subscribe>
				{({ canSubmit, isSubmitting }) => (
					<DefaultButton
						type="submit"
						fullWidth
						isDisabled={!canSubmit || isSubmitting}
					>
						{isSubmitting ? "処理中..." : "登録"}
					</DefaultButton>
				)}
			</form.Subscribe>
		</form>
	);
}
