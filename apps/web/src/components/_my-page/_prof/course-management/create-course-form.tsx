import { requirements } from "@lms-repo/db/schema/service";
import { CancelButton, DefaultButton } from "@lms-repo/ui/components/button";
import { InputForForm } from "@lms-repo/ui/components/input";
import { ControlledModal } from "@lms-repo/ui/components/modals/controlled-modal";
import { DAYS } from "@lms-repo/ui/lib/utils";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { useCreateCourse } from "@/hooks/courses";

interface CreateCourseFormProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
}

export function CreateCourseForm({
	isOpen,
	onOpenChange,
}: CreateCourseFormProps) {
	type Requirement = (typeof requirements)[number];

	// 土曜日と日曜日を除外
	const DAYS_EXCEPT_WEEKEND = DAYS.filter(
		(day) => day !== "土" && day !== "日",
	);
	// 曜日と数字のマッピング
	const daysMap: Record<string, number> = Object.fromEntries(
		DAYS_EXCEPT_WEEKEND.map((day, i) => [day, i + 1]),
	);
	// 曜日の配列
	const days = Object.keys(daysMap);

	const { mutateAsync: createCourse } = useCreateCourse();

	const form = useForm({
		defaultValues: {
			name: "",
			targetGrade: 1,
			weekdays: "月",
			period: 1,
			credits: 1,
			requirements: "任意" as Requirement,
			classRoom: "",
		},
		onSubmit: async ({ value }) => {
			const weekdays = daysMap[value.weekdays];

			if (!weekdays) {
				return;
			}

			const transformedValue = {
				...value,
				weekdays,
			};
			const res = await createCourse(transformedValue);
			const isSuccess = "message" in res;

			if (isSuccess) {
				onOpenChange(false);
			} else {
				return;
			}
		},
		validators: {
			onSubmit: z.object({
				name: z.string().min(1, "講義名は必須です"),
				targetGrade: z
					.number()
					.int("対象学年は整数で入力してください")
					.min(1, "対象学年は1から4の間で入力してください")
					.max(4, "対象学年は1から4の間で入力してください"),
				weekdays: z.enum(DAYS_EXCEPT_WEEKEND),
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
			}),
		},
	});

	return (
		<ControlledModal
			isOpen={isOpen}
			onOpenChange={onOpenChange}
			heading="講義の作成"
		>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation;
					form.handleSubmit();
				}}
				className="form-field p-1"
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
									"aria-describedby": "name-error",
									onBlur: field.handleBlur,
									onChange: (e) => field.handleChange(e.target.value),
								}}
								labelProps={{
									htmlFor: field.name,
									children: "講義名",
								}}
							/>
							{field.state.meta.errors.map((error) => (
								<p
									id="name-error"
									key={error?.message}
									className="text-red-500"
								>
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
								inputProps={{
									id: field.name,
									name: field.name,
									type: "number",
									min: 1,
									max: 4,
									step: 1,
									value: field.state.value,
									"aria-describedby": "targetGrade-error",
									onBlur: field.handleBlur,
									onChange: (e) => field.handleChange(Number(e.target.value)),
								}}
								labelProps={{
									htmlFor: field.name,
									children: "対象学年",
								}}
							/>
							{field.state.meta.errors.map((error) => (
								<p
									id="targetGrade-error"
									key={error?.message}
									className="text-red-500"
								>
									{error?.message}
								</p>
							))}
						</div>
					)}
				</form.Field>

				<form.Field name="weekdays">
					{(field) => (
						<div className="space-y-2">
							<InputForForm
								selectProps={{
									value: field.state.value,
									onChange: (value) => {
										if (value) {
											field.handleChange(value.toString());
										}
									},
									items: days,
									ariaLabel: "select weekdays",
								}}
								labelProps={{
									htmlFor: field.name,
									children: "曜日",
								}}
							/>
							{field.state.meta.errors.map((error) => (
								<p
									id="weekdays-error"
									key={error?.message}
									className="text-red-500"
								>
									{error?.message}
								</p>
							))}
						</div>
					)}
				</form.Field>

				<form.Field name="period">
					{(field) => (
						<div className="space-y-2">
							<InputForForm
								inputProps={{
									id: field.name,
									name: field.name,
									type: "number",
									min: 1,
									max: 5,
									step: 1,
									value: field.state.value,
									"aria-describedby": "period-error",
									onBlur: field.handleBlur,
									onChange: (e) => field.handleChange(Number(e.target.value)),
								}}
								labelProps={{
									htmlFor: field.name,
									children: "時限",
								}}
							/>
							{field.state.meta.errors.map((error) => (
								<p
									id="period-error"
									key={error?.message}
									className="text-red-500"
								>
									{error?.message}
								</p>
							))}
						</div>
					)}
				</form.Field>

				<form.Field name="credits">
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
									"aria-describedby": "credits-error",
									onBlur: field.handleBlur,
									onChange: (e) => field.handleChange(Number(e.target.value)),
								}}
								labelProps={{
									htmlFor: field.name,
									children: "単位数",
								}}
							/>
							{field.state.meta.errors.map((error) => (
								<p
									id="credits-error"
									key={error?.message}
									className="text-red-500"
								>
									{error?.message}
								</p>
							))}
						</div>
					)}
				</form.Field>

				<form.Field name="requirements">
					{(field) => (
						<div className="space-y-2">
							<InputForForm
								selectProps={{
									value: field.state.value,
									onChange: (value) => {
										if (value) {
											field.handleChange(value as Requirement);
										}
									},
									items: [...requirements],
									ariaLabel: "select requirements",
								}}
								labelProps={{
									htmlFor: field.name,
									children: "履修要件",
								}}
							/>
						</div>
					)}
				</form.Field>

				<form.Field name="classRoom">
					{(field) => (
						<div className="space-y-2">
							<InputForForm
								labelProps={{
									htmlFor: field.name,
									children: "教室",
								}}
								inputProps={{
									id: field.name,
									name: field.name,
									type: "text",
									value: field.state.value,
									"aria-describedby": "classRoom-error",
									onBlur: field.handleBlur,
									onChange: (e) => field.handleChange(e.target.value),
								}}
							/>
							{field.state.meta.errors.map((error) => (
								<p
									id="classRoom-error"
									key={error?.message}
									className="text-red-500"
								>
									{error?.message}
								</p>
							))}
						</div>
					)}
				</form.Field>

				<div className="flex justify-end gap-2">
					<CancelButton onPress={() => onOpenChange(false)}>
						キャンセル
					</CancelButton>
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
		</ControlledModal>
	);
}
