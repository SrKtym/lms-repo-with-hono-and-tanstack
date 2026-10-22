import { Text } from "react-email";
import { BaseEmailTemplate } from "./base-email-template";

export default function OtpNotificationEmail({
	email,
	otpCode,
}: {
	email: string;
	otpCode: string;
}) {
	return (
		<BaseEmailTemplate
			preview="OTP認証コード"
			title="OTP認証コード"
			email={email}
		>
			<Text className="text-base leading-relaxed text-gray-700">
				認証コード：
			</Text>
			<Text className="my-4 rounded-lg bg-gray-100 p-4 text-center text-2xl font-bold tracking-widest text-blue-600">
				{otpCode}
			</Text>
			<Text className="text-sm text-gray-600">
				このコードは10分で有効期限が切れます。認証を完了するためにコードを入力してください。
			</Text>
			<Text className="mt-4 text-sm text-amber-600">
				🔒 認証コードを誰かと共有しないでください。
			</Text>
		</BaseEmailTemplate>
	);
}
