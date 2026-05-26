import { Button, Text } from "@react-email/components";
import { BaseEmailTemplate } from "./base-email-template";

export default function NewAssignmentEmail({
	email,
	assignmentTitle,
	assignmentDescription,
	dueDate,
	viewUrl,
}: {
	email: string;
	assignmentTitle: string;
	assignmentDescription: string;
	dueDate?: string;
	viewUrl: string;
}) {
	return (
		<BaseEmailTemplate
			preview="新しい課題が投稿されました"
			title="新しい課題"
			email={email}
		>
			<Text className="text-base text-gray-700 leading-relaxed">
				新しい課題が投稿されました。
			</Text>
			<Text className="mt-4 text-lg font-bold text-gray-900">
				{assignmentTitle}
			</Text>
			<Text className="mt-2 text-base text-gray-700 leading-relaxed whitespace-pre-line">
				{assignmentDescription}
			</Text>
			{dueDate && (
				<Text className="mt-2 text-sm text-gray-600">
					提出期限: {dueDate}
				</Text>
			)}
			<Button
				href={viewUrl}
				className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white"
			>
				課題を確認する
			</Button>
		</BaseEmailTemplate>
	);
}
