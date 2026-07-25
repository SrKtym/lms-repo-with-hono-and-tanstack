import { Button, Text } from "react-email";
import { BaseEmailTemplate } from "./base-email-template";

export default function AssignmentReminderEmail({
	assignmentsDetail = [],
	viewUrl,
}: {
	assignmentsDetail?: {
		title: string;
		description: string;
		dueDate?: string;
	}[];
	viewUrl: string;
}) {
	return (
		<BaseEmailTemplate
			preview="課題の提出期限が近づいています"
			title="リマインダー: 課題の提出"
		>
			<Text className="text-base text-gray-700 leading-relaxed">
				課題の提出期限が近づいています。
			</Text>
			{assignmentsDetail.map((assignment) => (
				<>
					<Text className="mt-4 font-bold text-gray-900 text-lg">
						{assignment.title}
					</Text>
					<Text className="mt-2 whitespace-pre-line text-base text-gray-700 leading-relaxed">
						{assignment.description}
					</Text>
					{assignment.dueDate && (
						<Text className="mt-2 text-gray-600 text-sm">
							提出期限: {assignment.dueDate}
						</Text>
					)}
				</>
			))}
			<Button
				href={viewUrl}
				className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white"
			>
				課題を確認する
			</Button>
		</BaseEmailTemplate>
	);
}
