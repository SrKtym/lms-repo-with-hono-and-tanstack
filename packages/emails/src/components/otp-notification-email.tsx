import { Text } from "@react-email/components";
import { BaseEmailTemplate } from "./base-email-template";

export function OtpNotificationEmail({
	email,
	otpCode,
}: {
	email: string;
	otpCode: string;
}) {
	return (
		<BaseEmailTemplate
			preview="OTP verification code"
			title="Verification Code"
			email={email}
		>
			<Text className="text-base text-gray-700 leading-relaxed">
				Your verification code is:
			</Text>
			<Text className="my-4 rounded-lg bg-gray-100 p-4 text-center font-bold text-2xl text-blue-600 tracking-widest">
				{otpCode}
			</Text>
			<Text className="text-gray-600 text-sm">
				This code will expire in 10 minutes. Please enter it to complete your
				authentication.
			</Text>
			<Text className="mt-4 text-amber-600 text-sm">
				🔒 For your security, never share this code with anyone.
			</Text>
		</BaseEmailTemplate>
	);
}
