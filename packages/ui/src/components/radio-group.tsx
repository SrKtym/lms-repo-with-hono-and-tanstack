import { Radio, RadioGroup } from "@heroui/react";

// 2FA用のラジオグループ
export function RadioGroupFor2fa() {
	return (
		<RadioGroup isRequired>
			<Radio value="valid">
				<Radio.Control>
					<Radio.Indicator>
						<span />
					</Radio.Indicator>
				</Radio.Control>
				<Radio.Content />
			</Radio>
		</RadioGroup>
	);
}
