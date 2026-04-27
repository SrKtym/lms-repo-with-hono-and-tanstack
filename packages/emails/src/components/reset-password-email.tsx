import { Text } from "@react-email/components";
import { BaseEmailTemplate } from "./base-email-template";

export function ResetPasswordEmail({
	email,
	url,
}: {
	email: string;
	url: string;
}) {
	return (
		<BaseEmailTemplate
			preview="Reset your password"
			title="Password Reset"
			email={email}
		>
			<Text className="text-base text-gray-700 leading-relaxed">
				We received a request to reset your password. Click the link below to
				create a new password:
			</Text>
			<Text className="break-all font-medium text-base text-blue-600">
				{url}
			</Text>
			<Text className="mt-4 text-gray-600 text-sm">
				This link will expire in 30 minutes for security reasons.
			</Text>
			<Text className="mt-4 text-amber-600 text-sm">
				🔐 If you didn't request this reset, please ignore this email and your
				password will remain unchanged.
			</Text>
		</BaseEmailTemplate>
	);
}
