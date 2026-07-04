import type { Key } from "@heroui/react";
import { Select } from "@heroui/react";
import { SingleSelectListBox } from "./listbox";

interface DefaultSelectProps {
	value: string;
	onChange: (value: Key | null) => void;
	ariaLabel?: string;
	className?: string;
	items: string[];
}

// 汎用セレクト
export function DefaultSelect({
	value,
	onChange,
	className = "w-auto",
	ariaLabel = "Select option",
	items,
}: DefaultSelectProps) {
	return (
		<Select
			className={className}
			aria-label={ariaLabel}
			defaultValue={value}
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
		</Select>
	);
}
