import { Select } from "@heroui/react";
import { MultiSelectListBox, SingleSelectListBox } from "./listbox";

// 汎用セレクト
export function DefaultSelect({
	value,
	onValueChange,
	items,
	ariaLabel = "Select option",
}: {
	value: string;
	onValueChange: (value: string) => void;
	items: string[];
	ariaLabel?: string;
}) {
	return (
		<Select aria-label={ariaLabel}>
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

export function SelectForDataTable({
	placeholder,
	items,
	ariaLabel,
}: {
	placeholder: string;
	items: string[];
	ariaLabel: string;
}) {
	return (
		<Select placeholder={placeholder} aria-label={ariaLabel}>
			<Select.Trigger>
				<Select.Value />
				<Select.Indicator />
			</Select.Trigger>
			<Select.Popover>
				<MultiSelectListBox items={items} />
			</Select.Popover>
		</Select>
	);
}
