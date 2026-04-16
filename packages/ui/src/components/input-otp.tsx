import { InputOTP } from "@heroui/react";

export function InputOTPFor2fa({
	name,
	value,
	onChange,
}: {
	name: string;
	value: string;
	onChange: (value: string) => void;
}) {
	return (
		<InputOTP name={name} value={value} maxLength={6} onChange={onChange}>
			<InputOTP.Group>
				<InputOTP.Slot index={0} />
				<InputOTP.Slot index={1} />
				<InputOTP.Slot index={2} />
			</InputOTP.Group>
			<InputOTP.Separator />
			<InputOTP.Group>
				<InputOTP.Slot index={3} />
				<InputOTP.Slot index={4} />
				<InputOTP.Slot index={5} />
			</InputOTP.Group>
		</InputOTP>
	);
}
