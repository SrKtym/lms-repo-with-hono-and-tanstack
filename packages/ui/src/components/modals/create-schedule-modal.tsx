import { Modal } from "@heroui/react";
import { getLocalTimeZone, now } from "@lms-repo/ui/lib/utils";
import type React from "react";
import { useState } from "react";
import { CancelButton, DefaultButton } from "../button";
import { InputForForm } from "../input";

interface Schedule {
	title: string;
	description: string;
	start: Date;
	end: Date;
}

interface CreateScheduleModalProps {
	triggerButton: React.ReactNode;
	onCreateSchedule: (schedule: Omit<Schedule, "id">) => void;
}

// Create schedule modal
export function CreateScheduleModal({
	triggerButton,
	onCreateSchedule,
}: CreateScheduleModalProps) {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [dateRange, setDateRange] = useState<{ start: Date; end: Date } | null>(
		null,
	);

	const handleSubmit = () => {
		if (!title || !dateRange) {
			return;
		}

		if (dateRange.start >= dateRange.end) {
			return;
		}

		onCreateSchedule({
			title,
			description,
			start: dateRange.start,
			end: dateRange.end,
		});

		// Reset form
		setTitle("");
		setDescription("");
		setDateRange(null);
	};

	return (
		<Modal>
			{triggerButton}
			<Modal.Backdrop variant="transparent">
				<Modal.Container size="lg">
					<Modal.Dialog>
						<Modal.CloseTrigger />
						<Modal.Header>
							<Modal.Heading className="text-gray-900 dark:text-white">
								スケジュールの作成
							</Modal.Heading>
						</Modal.Header>
						<Modal.Body>
							<div className="space-y-4 p-3">
								<InputForForm
									inputProps={{
										id: "title",
										type: "text",
										value: title,
										onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
											setTitle(e.target.value),
										placeholder: "タイトルを入力",
									}}
									labelProps={{
										children: "タイトル",
										className:
											"text-gray-700 text-sm font-medium dark:text-gray-300",
									}}
									isRequired={false}
								/>

								<InputForForm
									labelProps={{
										children: "説明",
										className:
											"text-gray-700 text-sm font-medium dark:text-gray-300",
									}}
									textAreaProps={{
										id: "description",
										value: description,
										onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) =>
											setDescription(e.target.value),
										placeholder: "説明を入力",
										rows: 3,
									}}
									isRequired={false}
								/>

								<InputForForm
									labelProps={{
										children: "期間",
									}}
									dateRangePickerProps={{
										defaultValue: {
											start: now(getLocalTimeZone()),
											end: now(getLocalTimeZone()),
										},
										onChange: (value) => {
											if (value && value.start && value.end) {
												// DateRangePicker from Date object conversion
												const start = new Date(value.start.toString());
												const end = new Date(value.end.toString());
												setDateRange({ start, end });
											}
										},
									}}
									isRequired={true}
								/>
							</div>
						</Modal.Body>
						<Modal.Footer>
							<div className="flex justify-end gap-2">
								<CancelButton slot="close">キャンセル</CancelButton>
								<DefaultButton onPress={handleSubmit}>作成</DefaultButton>
							</div>
						</Modal.Footer>
					</Modal.Dialog>
				</Modal.Container>
			</Modal.Backdrop>
		</Modal>
	);
}
