import { ColorSwatchPicker as Picker } from "@heroui/react";

// 汎用カラースイッチピッカー
export function ColorSwatchPicker() {
	return (
		<Picker>
			<Picker.Item color="#F43F5E">
				<Picker.Swatch />
				<Picker.Indicator />
			</Picker.Item>
			<Picker.Item color="#D946EF">
				<Picker.Swatch />
				<Picker.Indicator />
			</Picker.Item>
			<Picker.Item color="#8B5CF6">
				<Picker.Swatch />
				<Picker.Indicator />
			</Picker.Item>
		</Picker>
	);
}
