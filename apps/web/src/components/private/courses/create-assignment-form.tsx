import { assignmentFormat } from "@lms-repo/db/schema/service";
import { CancelButton, DefaultButton } from "@lms-repo/ui/components/button";
import { InputForForm } from "@lms-repo/ui/components/input";
import { CreateAssignmentModal } from "@lms-repo/ui/components/modals/create-assignment-modal";
import { DefaultSelect } from "@lms-repo/ui/components/select";
import {
	getLocalTimeZone,
	now,
	type ZonedDateTime,
} from "@lms-repo/ui/lib/utils";
import { useForm } from "@tanstack/react-form";
import { useParams } from "@tanstack/react-router";
import { z } from "zod";
import { useCreateAssignment } from "@/hooks/assignments";

export function CreateAssignmentForm() {
	const dateTime = now(getLocalTimeZone());
	const { "course-id": courseId } = useParams({
		from: "/_my-page/course-list/{-$course-id}/{-$content-id}",
	});
	const createAssignment = useCreateAssignment();
	const form = useForm({
		defaultValues: {
			title: "",
			description: "",
			points: 0,
			dueDate: dateTime,
			format: "text",
			courseId: "",
		},
		onSubmit: async ({ value }) => {
			const { dueDate, ...rest } = value;
			createAssignment.mutate({
				...rest,
				dueDate: dueDate.toDate(),
			});
		},
		validators: {
			onSubmit: z.object({
				title: z.string().min(1),
				description: z.string(),
				points: z.number(),
				dueDate: z.custom<ZonedDateTime>(),
				format: z.enum(assignmentFormat),
				courseId: z.string().min(1),
			}),
		},
	});

	return (
		<CreateAssignmentModal
			triggerButton={<DefaultButton>課題の作成</DefaultButton>}
		>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation;
					form.handleSubmit();
				}}
				className="form-field p-1"
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
								datePickerProps={{
									defaultValue: field.state.value,
									onChange: (value) => {
										if (value) {
											field.handleChange(value);
										}
									},
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

				<div className="flex justify-end gap-2">
					<CancelButton slot="close">キャンセル</CancelButton>
					<form.Subscribe>
						{({ canSubmit, isSubmitting }) => (
							<DefaultButton
								type="submit"
								isDisabled={!canSubmit || isSubmitting}
							>
								{isSubmitting ? "処理中..." : "作成"}
							</DefaultButton>
						)}
					</form.Subscribe>
				</div>
			</form>
		</CreateAssignmentModal>
	);
}
