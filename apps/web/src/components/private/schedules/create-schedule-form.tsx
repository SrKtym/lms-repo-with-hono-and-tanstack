import type { Schedules, SchedulesOptional } from "@lms-repo/db/types";
import { CalendarClock } from "@lms-repo/ui/assets/icons/calendar-clock";
import { CancelButton, DefaultButton } from "@lms-repo/ui/components/button";
import { ColorSwatchPicker } from "@lms-repo/ui/components/color-swatch-picker";
import { InputForForm } from "@lms-repo/ui/components/input";
import { CreateScheduleModal } from "@lms-repo/ui/components/modals/create-schedule-modal";
import {
	getLocalTimeZone,
	now,
	type ZonedDateTime,
} from "@lms-repo/ui/lib/utils";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { useCreateSchedule } from "@/hooks/schedules";

export function CreateScheduleForm() {
	const dateTime = now(getLocalTimeZone());
	const createSchedule = useCreateSchedule();
	const form = useForm({
		defaultValues: {
			title: "",
			description: "",
			timeSpan: { start: dateTime, end: dateTime },
			theme: "#059669",
		},
		onSubmit: async ({ value }) => {
			const { timeSpan, ...rest } = value;

			const scheduleData: Omit<Schedules, SchedulesOptional> = {
				...rest,
				startTime: timeSpan.start.toDate(),
				endTime: timeSpan.end.toDate(),
			};

			await createSchedule.mutateAsync(scheduleData);
		},
		validators: {
			onSubmit: z.object({
				title: z
					.string()
					.transform((value) => (value === "" ? "タイトルなし" : value)),
				description: z.string(),
				timeSpan: z
					.object({
						start: z.custom<ZonedDateTime>(),
						end: z.custom<ZonedDateTime>(),
					})
					.refine((value) => dateTime <= value.start, {
						error: "開始日時は現在時刻以降でなければなりません。",
					})
					.refine((value) => value.start < value.end, {
						error: "開始日時は終了日時よりも前でなければなりません。",
					})
					.transform((value) => ({
						start: value.start.toDate(),
						end: value.end.toDate(),
					})),
				theme: z
					.string()
					.regex(/^#[0-9a-f]{6}$/i, "有効なカラーコードを入力してください"),
			}),
		},
	});

	return (
		<CreateScheduleModal
			triggerButton={
				<DefaultButton>
					<CalendarClock />
					スケジュール追加
				</DefaultButton>
			}
		>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
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
									placeholder: "タイトルを入力",
								}}
								labelProps={{
									htmlFor: field.name,
									children: "タイトル",
									className:
										"text-gray-700 text-sm font-medium dark:text-gray-300",
								}}
								isRequired={false}
							/>
							{field.state.meta.errors.map((error) => (
								<p key={error?.message} className="text-red-500">
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
								labelProps={{
									children: "説明",
									className:
										"text-gray-700 text-sm font-medium dark:text-gray-300",
								}}
								textAreaProps={{
									id: field.name,
									name: field.name,
									value: field.state.value,
									onBlur: field.handleBlur,
									onChange: (e) => field.handleChange(e.target.value),
									placeholder: "説明を入力",
									rows: 3,
								}}
								isRequired={false}
							/>
							{field.state.meta.errors.map((error) => (
								<p key={error?.message} className="text-red-500">
									{error?.message}
								</p>
							))}
						</div>
					)}
				</form.Field>
				<form.Field name="timeSpan">
					{(field) => (
						<div className="space-y-2">
							<InputForForm
								labelProps={{
									children: "期間",
								}}
								dateRangePickerProps={{
									defaultValue: {
										start: field.state.value?.start,
										end: field.state.value?.end,
									},
									onChange: (value) => {
										if (value) {
											field.handleChange({
												start: value.start,
												end: value.end,
											});
										}
									},
								}}
								isRequired={true}
							/>
							{field.state.meta.errors.map((error) => (
								<p key={error?.message} className="text-red-500">
									{error?.message}
								</p>
							))}
						</div>
					)}
				</form.Field>
				<form.Field name="theme">
					{(field) => (
						<div className="space-y-2">
							<ColorSwatchPicker
								value={field.state.value}
								onChange={(color) => field.handleChange(color.toString("hex"))}
							/>
							{field.state.meta.errors.map((error) => (
								<p key={error?.message} className="text-red-500">
									{error?.message}
								</p>
							))}
						</div>
					)}
				</form.Field>
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
		</CreateScheduleModal>
	);
}
