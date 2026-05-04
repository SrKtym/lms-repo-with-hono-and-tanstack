import { assignmentFormat } from "@lms-repo/db/schema/service";
import { InputForForm } from "@lms-repo/ui/components/input";
import { DefaultSelect } from "@lms-repo/ui/components/select";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { useCreateAssignment } from "@/hooks/assignments";
import { useParams } from "@tanstack/react-router";
import { CreateAssignmentModal } from "@lms-repo/ui/components/modals/create-assignment-modal";
import { DefaultButton } from "@lms-repo/ui/components/button";

export function CreateAssignmentForm() {
	const { "course-id": courseId } = useParams({ from: "/_my-page/course-list/{-$course-id}/{-$content-id}" });
	const createAssignment = useCreateAssignment();
	const form = useForm({
		defaultValues: {
			title: "",
			description: "",
			points: 0,
			dueDate: new Date(),
			format: "text",
			courseId: "",
		},
		onSubmit: async ({ value }) => {
			createAssignment.mutate(value);
		},
		validators: {
			onSubmit: z.object({
				title: z.string().min(1),
				description: z.string(),
				points: z.number(),
				dueDate: z.date().min(new Date()),
				format: z.enum(assignmentFormat),
				courseId: z.string().min(1),
			}),
		},
	});

	return (
		<CreateAssignmentModal
			triggerButton={
				<DefaultButton>
					作成
				</DefaultButton>
			}
		>
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
									onChange: (e) => field.handleChange(Number(e.target.value)),
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

				<input type="hidden" name="courseId" value={courseId} />
			</form>
		</CreateAssignmentModal>
	);
}
