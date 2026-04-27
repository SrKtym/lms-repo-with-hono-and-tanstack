import { Text } from "@react-email/components";
import { BaseEmailTemplate } from "./base-email-template";

export function DeleteAccountEmail({
	email,
	url,
}: {
	email: string;
	url: string;
}) {
	return (
		<BaseEmailTemplate
			preview="Account deletion confirmation"
			title="Delete Your Account"
			email={email}
		>
			<Text className="text-base text-gray-700 leading-relaxed">
				We received a request to delete your account. If you made this request,
				please click the link below to confirm:
			</Text>
			<Text className="break-all font-medium text-base text-blue-600">
				{url}
			</Text>
			<Text className="mt-4 font-medium text-red-600 text-sm">
				⚠️ This action cannot be undone. All your data will be permanently
				deleted.
			</Text>
			<Text className="mt-4 text-gray-600 text-sm">
				If you didn't request this deletion, please secure your account
				immediately.
			</Text>
		</BaseEmailTemplate>
	);
}
