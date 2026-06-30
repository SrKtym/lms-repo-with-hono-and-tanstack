import { type Color, Label, ColorSwatchPicker as Picker } from "@heroui/react";

interface ColorSwatchPickerProps {
	value: string;
	onChange: (value: Color) => void;
}

// 汎用カラースオッチピッカー
export function ColorSwatchPicker({ value, onChange }: ColorSwatchPickerProps) {
	const colors = [
		"#F43F5E",
		"#EF4444",
		"#F59E0B",
		"#D946EF",
		"#8B5CF6",
		"#3B82F6",
		"#10B981",
		"#059669",
	] as const;

	return (
		<div className="space-y-2">
			<Label>テーマ</Label>
			<Picker value={value} onChange={onChange}>
				{colors.map((color) => (
					<Picker.Item key={color} color={color}>
						<Picker.Swatch />
						<Picker.Indicator />
					</Picker.Item>
				))}
			</Picker>
		</div>
	);
}
