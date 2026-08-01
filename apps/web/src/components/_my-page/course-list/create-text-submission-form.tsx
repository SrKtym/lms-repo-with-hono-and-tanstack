import { Check } from "@lms-repo/ui/assets/icons/check";
import { DefaultButton } from "@lms-repo/ui/components/button";
import { DefaultDisclosure } from "@lms-repo/ui/components/disclosure";
import { InputForForm } from "@lms-repo/ui/components/input";
import { useForm } from "@tanstack/react-form";
import { useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import {
	useCreateTextSubmission,
	useTextSubmissions,
} from "@/hooks/submissions";

export function CreateTextSubmissionForm() {
	const { "assignment-id": assignmentId } = useSearch({
		from: "/_my-page/course-list",
	});

	const { mutateAsync: createTextSubmission } = useCreateTextSubmission();
	const { data: textSubmissions } = useTextSubmissions(assignmentId);
	const [success, setSuccess] = useState(false);

	const form = useForm({
		defaultValues: {
			title: "",
			description: "",
			assignmentId: assignmentId || "",
		},
		onSubmit: async ({ value }) => {
			await createTextSubmission(value);
			setSuccess(true);
		},
		validators: {
			onSubmit: z.object({
				title: z.string().min(1).max(100),
				description: z.string().min(1).max(2000),
				assignmentId: z.string().min(1),
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
								minLength: 1,
								maxLength: 100,
								value: field.state.value,
								"aria-describedby": "title-error",
								onBlur: field.handleBlur,
								onChange: (e) => field.handleChange(e.target.value),
								placeholder: "タイトルを入力してください",
							}}
							labelProps={{
								htmlFor: field.name,
								children: "タイトル",
							}}
						/>
						{field.state.meta.errors.map((error) => (
							<p id="title-error" key={error?.message} className="text-red-500">
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
							textAreaProps={{
								id: field.name,
								name: field.name,
								minLength: 1,
								maxLength: 2000,
								value: field.state.value,
								"aria-describedby": "description-error",
								onBlur: field.handleBlur,
								onChange: (e) => field.handleChange(e.target.value),
								placeholder: "最大2000文字まで入力できます",
								rows: 12,
							}}
							labelProps={{
								htmlFor: field.name,
								children: "説明",
							}}
						/>
						{field.state.meta.errors.map((error) => (
							<p
								id="description-error"
								key={error?.message}
								className="text-red-500"
							>
								{error?.message}
							</p>
						))}
					</div>
				)}
			</form.Field>

			<form.Field name="assignmentId">
				{(field) => (
					<input
						type="hidden"
						name={field.name}
						value={field.state.value}
						onChange={(e) => field.handleChange(e.target.value)}
					/>
				)}
			</form.Field>

			{/* 成功メッセージ */}
			{success && (
				<div className="alert-success">
					<div className="flex items-center gap-2">
						<Check width={24} height={24} className="alert-success-text" />
						<p className="alert-success-text text-sm">提出が完了しました。</p>
					</div>
				</div>
			)}

			{/* 提出物の表示 */}
			{textSubmissions && textSubmissions.length > 0 && (
				<div className="mx-auto w-full max-w-2xl text-center">
					<DefaultDisclosure title="提出物の表示">
						<div className="space-y-4 p-4">
							{textSubmissions.map((submission) => (
								<div
									key={submission.id}
									className="rounded-lg border border-divider bg-default-50 p-4 dark:bg-default-100/50"
								>
									<div className="mb-2 flex items-center justify-between">
										<h3 className="font-medium text-lg">{submission.title}</h3>
										{submission.createdAt && (
											<p className="text-default-500 text-xs">
												{new Date(submission.createdAt).toLocaleString(
													"ja-JP",
													{
														year: "numeric",
														month: "short",
														day: "numeric",
														hour: "2-digit",
														minute: "2-digit",
													},
												)}
											</p>
										)}
									</div>
									<p className="whitespace-pre-wrap text-default-600 dark:text-default-400">
										{submission.description}
									</p>
								</div>
							))}
						</div>
					</DefaultDisclosure>
				</div>
			)}

			<div className="flex justify-end">
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
	);
}
