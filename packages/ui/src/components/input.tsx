import { FieldError, Input, Label, TextArea, TextField } from "@heroui/react";
import { DatePicker } from "./date-picker";
import { DateRangePicker } from "./date-range-picker";

interface InputForFormProps {
	inputProps?: React.ComponentProps<typeof Input>;
	labelProps: React.ComponentProps<typeof Label>;
	textAreaProps?: React.ComponentProps<typeof TextArea>;
	datePickerProps?: React.ComponentProps<typeof DatePicker>;
	dateRangePickerProps?: React.ComponentProps<typeof DateRangePicker>;
	isRequired?: boolean;
}

// // フォーム用の入力コンポーネント
export function InputForForm({
	inputProps,
	labelProps,
	textAreaProps,
	datePickerProps,
	dateRangePickerProps,
	isRequired,
}: InputForFormProps) {
	return (
		<TextField fullWidth isRequired={isRequired ?? true}>
			<Label {...labelProps}>{labelProps.children}</Label>
			{inputProps && <Input {...inputProps} />}
			{textAreaProps && <TextArea {...textAreaProps} />}
			{datePickerProps && <DatePicker {...datePickerProps} />}
			{dateRangePickerProps && <DateRangePicker {...dateRangePickerProps} />}
			{!datePickerProps && !dateRangePickerProps && <FieldError />}
		</TextField>
	);
}
