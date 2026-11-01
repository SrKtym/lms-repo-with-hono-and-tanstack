import { Text } from "react-email";
import { BaseEmailTemplate } from "./base-email-template";

export default function RoleChangeRequestEmail({
	adminEmail,
	email,
	name,
	viewUrl,
}: {
	adminEmail: string;
	email: string;
	name: string;
	viewUrl: string;
}) {
	return (
		<BaseEmailTemplate
			preview="ロール変更申請"
			title="ロール変更申請"
			email={adminEmail}
		>
			<Text className="text-base leading-relaxed text-gray-700">
				{name} ({email})
				さんからロール変更申請が届きました。ユーザーロールを「教員」に変更する場合は以下のリンクへ進み、設定を完了してください。
			</Text>
			<Text className="text-base font-medium break-all text-blue-600">
				{viewUrl}
			</Text>
		</BaseEmailTemplate>
	);
}
