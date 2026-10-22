import { Text } from "react-email";
import { BaseEmailTemplate } from "./base-email-template";

export default function ResetPasswordEmail({
	email,
	url,
}: {
	email: string;
	url: string;
}) {
	return (
		<BaseEmailTemplate
			preview="パスワードリセットの確認"
			title="パスワードのリセット"
			email={email}
		>
			<Text className="text-base leading-relaxed text-gray-700">
				パスワードリセットのリクエストを受け取りました。下のリンクをクリックして
				新しいパスワードを作成してください。
			</Text>
			<Text className="text-base font-medium break-all text-blue-600">
				{url}
			</Text>
			<Text className="mt-4 text-sm text-gray-600">
				このリンクは1時間で有効期限が切れます。
			</Text>
			<Text className="mt-4 text-sm text-amber-600">
				🔐
				このリセットをリクエストしていない場合は、このメールを無視してください。
			</Text>
		</BaseEmailTemplate>
	);
}
