import { formSchema } from "@lms-repo/api/schema/students";
import { getDepartmentName } from "@lms-repo/db/utils/helpers";
import { DefaultButton } from "@lms-repo/ui/components/button";
import { InputForForm } from "@lms-repo/ui/components/input";
import { useForm } from "@tanstack/react-form";
import { useRegisterStudentData } from "@/hooks/students";

export function CreateStudentDataForm() {
	const departments = getDepartmentName();

	const { mutateAsync: registerStudentData } = useRegisterStudentData();

	const form = useForm({
		defaultValues: {
			grade: 1,
			departmentName: "",
		},
		onSubmit: async ({ value }) => {
			await registerStudentData(value);
			location.reload();
		},
		validators: {
			onSubmit: formSchema,
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
			<form.Field name="grade">
				{(field) => (
					<div className="space-y-2">
						<InputForForm
							inputProps={{
								id: field.name,
								name: field.name,
								type: "number",
								min: 1,
								max: 4,
								step: 1,
								value: field.state.value,
								"aria-describedby": "grade-error",
								onBlur: field.handleBlur,
								onChange: (e) => field.handleChange(Number(e.target.value)),
							}}
							labelProps={{
								htmlFor: field.name,
								children: "学年",
							}}
						/>
						{field.state.meta.errors.map((error) => (
							<p id="grade-error" key={error?.message} className="text-red-500">
								{error?.message}
							</p>
						))}
					</div>
				)}
			</form.Field>
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
								isRequired: true,
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
