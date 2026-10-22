import { Text } from "react-email";
import { BaseEmailTemplate } from "./base-email-template";

export default function ConfirmSignUpEmail({
	email,
	url,
}: {
	email: string;
	url: string;
}) {
	return (
		<BaseEmailTemplate
			preview="サインアップの確認"
			title="ようこそLMSへ"
			email={email}
		>
			<Text className="text-base leading-relaxed text-gray-700">
				サインアップしました。下のリンクをクリックして登録を完了してください。
			</Text>
			<Text className="text-base font-medium break-all text-blue-600">
				{url}
			</Text>
			<Text className="mt-4 text-sm text-gray-600">
				このリンクは1時間で有効期限が切れます。
			</Text>
			<Text className="mt-4 text-sm text-gray-600">
				登録が完了したら、二段階認証を設定することを推奨します。
			</Text>
		</BaseEmailTemplate>
	);
}
