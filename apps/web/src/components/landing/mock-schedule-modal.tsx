import { InputForForm } from "@lms-repo/ui/components/input";
import { getLocalTimeZone, now } from "@lms-repo/ui/lib/utils";
import * as m from "motion/react-m";

interface MockScheduleModalProps {
	onClose: () => void;
	scheduleTitle: string;
	handleTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	inputRef: React.RefObject<HTMLInputElement | null>;
	isReadOnly?: boolean;
}

export function MockScheduleModal({
	onClose,
	scheduleTitle,
	handleTitleChange,
	inputRef,
	isReadOnly = false,
}: MockScheduleModalProps) {
	const dateTime = now(getLocalTimeZone());

	return (
		<m.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.2 }}
			className="absolute inset-0 z-20 flex items-center justify-center"
			onClick={onClose}
		>
			<m.div
				initial={{ scale: 0.95, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				exit={{ scale: 0.95, opacity: 0 }}
				transition={{ duration: 0.2 }}
				className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800"
				onClick={(e) => e.stopPropagation()}
			>
				<h3 className="mb-4 font-bold text-gray-900 text-lg dark:text-white">
					スケジュールの追加
				</h3>
				<div className="form-field">
					<div className="space-y-2">
						<InputForForm
							inputProps={{
								id: "schedule-title",
								name: "schedule-title",
								type: "text",
								value: scheduleTitle,
								onBlur: () => {},
								onChange: handleTitleChange,
								placeholder: "タイトルを入力",
								ref: inputRef,
								readOnly: isReadOnly,
							}}
							labelProps={{
								htmlFor: "schedule-title",
								children: "タイトル",
							}}
							isRequired={false}
						/>
					</div>

					<div className="space-y-2">
						<InputForForm
							textAreaProps={{
								id: "schedule-description",
								name: "schedule-description",
								onBlur: () => {},
								onChange: () => {},
								placeholder: "説明を入力",
								rows: 3,
							}}
							labelProps={{
								htmlFor: "schedule-description",
								children: "説明",
							}}
							isRequired={false}
						/>
					</div>

					<div className="space-y-2">
						<InputForForm
							dateRangePickerProps={{
								defaultValue: {
									start: dateTime,
									end: dateTime,
								},
								onChange: () => {},
							}}
							labelProps={{
								children: "期間",
							}}
							isRequired={true}
						/>
					</div>
				</div>
			</m.div>
		</m.div>
	);
}
