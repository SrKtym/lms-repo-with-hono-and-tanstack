import { FieldError, Input, Label, TextArea, TextField } from "@heroui/react";
import { DateRangePicker } from "./date-range-picker";

// // フォーム用の入力コンポーネント
export function InputForForm({
	inputProps,
	labelProps,
	textAreaProps,
	dateRangePickerProps,
	isRequired,
}: {
	inputProps?: React.ComponentProps<typeof Input>;
	labelProps: React.ComponentProps<typeof Label>;
	textAreaProps?: React.ComponentProps<typeof TextArea>;
	dateRangePickerProps?: React.ComponentProps<typeof DateRangePicker>;
	isRequired?: boolean;
}) {
	return (
		<TextField fullWidth isRequired={isRequired ?? true}>
			<Label {...labelProps}>{labelProps.children}</Label>
			{inputProps && <Input {...inputProps} />}
			{textAreaProps && <TextArea {...textAreaProps} />}
			{dateRangePickerProps ? (
				<DateRangePicker {...dateRangePickerProps} />
			) : (
				<FieldError />
			)}
		</TextField>
	);
}
