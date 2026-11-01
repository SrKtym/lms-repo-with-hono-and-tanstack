import type { Key } from "@heroui/react";
import { FieldError, Select } from "@heroui/react";
import { SingleSelectListBox } from "./listbox";

interface DefaultSelectProps {
	value: string;
	onChange: (value: Key | null) => void;
	ariaLabel?: string;
	className?: string;
	items: string[];
	isRequired?: boolean;
}

// 汎用セレクト
export function DefaultSelect({
	value,
	onChange,
	className = "w-auto",
	ariaLabel = "Select option",
	items,
	isRequired = false,
}: DefaultSelectProps) {
	return (
		<Select
			className={className}
			aria-label={ariaLabel}
			defaultValue={value}
			isRequired={isRequired}
			onChange={(value) => {
				onChange(value);
			}}
		>
			<Select.Trigger>
				<Select.Value />
				<Select.Indicator />
			</Select.Trigger>
			<Select.Popover>
				<SingleSelectListBox items={items} />
			</Select.Popover>
			<FieldError />
		</Select>
	);
}
