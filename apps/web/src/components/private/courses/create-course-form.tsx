import { requirements } from "@lms-repo/db/schema/service";
import { DefaultButton } from "@lms-repo/ui/components/button";
import { InputForForm } from "@lms-repo/ui/components/input";
import { DefaultModal } from "@lms-repo/ui/components/modals/default-modal";
import { DefaultSelect } from "@lms-repo/ui/components/select";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { client } from "@/lib/hono-client";

export function CreateCourseForm() {
	type Requirement = (typeof requirements)[number];
	const form = useForm({
		defaultValues: {
			name: "",
			targetGrade: 1,
			weekdays: 1,
			period: 1,
			credits: 1,
			requirements: "任意" as Requirement,
			classRoom: "",
			departmentId: "",
			professorId: "",
		},
		onSubmit: async ({ value }) => {
			const res = await client.api.courses.$post({
				json: value,
			});
			const data = await res.json();
		},
		validators: {
			onSubmit: z.object({
				name: z.string().min(1, "講義名は必須です"),
				targetGrade: z
					.number()
					.int("対象学年は整数で入力してください")
					.min(1, "対象学年は1から4の間で入力してください")
					.max(4, "対象学年は1から4の間で入力してください"),
				weekdays: z.number().min(1, "曜日は必須です"),
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
					error: "履修区分を選択してください。",
				}),
				classRoom: z.string(),
				departmentId: z.string().min(1),
				professorId: z.string().min(1),
			}),
		},
	});

	return (
		<DefaultModal 
			triggerButton={<DefaultButton>講義を作成</DefaultButton>}
			heading="講義の作成"
		>
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
									onChange: (e) => field.handleChange(Number(e.target.value)),
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
									onChange: (e) => field.handleChange(Number(e.target.value)),
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
									onChange: (e) => field.handleChange(Number(e.target.value)),
								}}
							/>
						</div>
					)}
				</form.Field>

				<form.Field name="credits">
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
									onChange: (e) => field.handleChange(Number(e.target.value)),
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
								onChange={(value) => field.handleChange(value as Requirement)}
								items={[...requirements]}
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

				<form.Field name="departmentId">
					{(field) => (
						<div className="space-y-2">
							<InputForForm
								labelProps={{
									children: "学科ID",
								}}
								inputProps={{
									id: field.name,
									name: field.name,
									type: "hidden",
									value: field.state.value,
								}}
							/>
						</div>
					)}
				</form.Field>

				<form.Field name="professorId">
					{(field) => (
						<div className="space-y-2">
							<InputForForm
								labelProps={{
									children: "教員ID",
								}}
								inputProps={{
									id: field.name,
									name: field.name,
									type: "hidden",
									value: field.state.value,
								}}
							/>
						</div>
					)}
				</form.Field>
			</form>
		</DefaultModal>
	);
}
