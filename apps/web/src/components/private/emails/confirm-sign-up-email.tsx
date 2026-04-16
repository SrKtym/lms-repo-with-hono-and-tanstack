import { Text } from "@react-email/components";
import { BaseEmailTemplate } from "./base-email-template";

export function ConfirmSignUpEmail({
	email,
	url,
}: {
	email: string;
	url: string;
}) {
	return (
		<BaseEmailTemplate
			preview="Confirm your sign up"
			title="Welcome to LMS!"
			email={email}
		>
			<Text className="text-base text-gray-700 leading-relaxed">
				Thank you for signing up! Please click the link below to complete your
				registration:
			</Text>
			<Text className="break-all font-medium text-base text-blue-600">
				{url}
			</Text>
			<Text className="mt-4 text-gray-600 text-sm">
				After completing registration, we recommend setting up two-factor
				authentication for enhanced security.
			</Text>
		</BaseEmailTemplate>
	);
}
