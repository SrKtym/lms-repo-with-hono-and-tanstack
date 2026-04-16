import { FileDocument } from "@lms-repo/ui/assets/icons/file-document";
import { Settings } from "@lms-repo/ui/assets/icons/settings";
import { useState } from "react";
import { DefaultButton } from "../button";
import { DefaultSelect } from "../select";
import { BaseCard } from "./base-card";

// モックデータ
const mockAssignments = [
	{
		id: "1",
		title: "データ構造レポート",
		description: "二分探索木の実装と分析",
		courseName: "データ構造とアルゴリズム",
		courseId: "1",
		dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2日後
		priority: "high",
		status: "pending",
		type: "essay",
	},
	{
		id: "2",
		title: "Web開発ミニプロジェクト",
		description: "Reactを使用したTODOアプリの作成",
		courseName: "Web開発基礎",
		courseId: "3",
		dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5日後
		priority: "medium",
		status: "pending",
		type: "project",
	},
	{
		id: "3",
		title: "アルゴリズム小テスト",
		description: "ソートアルゴリズムに関する選択問題",
		courseName: "データ構造とアルゴリズム",
		courseId: "1",
		dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1週間後
		priority: "medium",
		status: "pending",
		type: "quiz",
	},
	{
		id: "4",
		title: "論文読解",
		description: "機械学習に関する最新論文の要約",
		courseName: "人工知能論",
		courseId: "2",
		dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12日後
		priority: "low",
		status: "pending",
		type: "reading",
	},
];

const mockCourseDataList = [
	{ course: { name: "データ構造とアルゴリズム" } },
	{ course: { name: "Web開発基礎" } },
	{ course: { name: "人工知能論" } },
];

export function UpcomingAssignmentsCard() {
	const [selectedPeriod, setSelectedPeriod] = useState("7日以内");

	const assignments = mockAssignments.filter(
		(assignment) =>
			mockCourseDataList.find(
				({ course }) => course.name === assignment.courseName,
			) &&
			assignment.dueDate.getTime() - new Date().getTime() <=
				(selectedPeriod === "3日以内" ? 3 : 7) * 24 * 60 * 60 * 1000,
	);

	const getDaysUntilDue = (dueDate: Date) => {
		const now = new Date();
		const diffTime = dueDate.getTime() - now.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays < 0) return `期限切れ (${Math.abs(diffDays)}日前)`;
		if (diffDays === 0) return "今日が期限";
		if (diffDays === 1) return "明日が期限";
		return `${diffDays}日後`;
	};

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case "high":
				return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800";
			case "medium":
				return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800";
			case "low":
				return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800";
			default:
				return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700";
		}
	};

	const getTypeIcon = (type: string) => {
		switch (type) {
			case "essay":
				return "📝";
			case "quiz":
				return "📋";
			case "project":
				return "🚀";
			case "reading":
				return "📚";
			default:
				return "📄";
		}
	};

	return (
		<BaseCard className="relative overflow-hidden border-0 bg-gradient-to-br from-white to-orange-50/30 p-5 shadow-lg backdrop-blur-sm dark:from-gray-800 dark:to-orange-900/20">
			{/* Decorative background elements */}
			<div className="absolute -top-16 -right-16 h-32 w-32 rounded-full bg-gradient-to-br from-orange-400/10 to-yellow-400/10 blur-2xl" />
			<div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-gradient-to-tr from-yellow-400/10 to-orange-400/10 blur-xl" />

			<div className="relative z-10">
				<div className="mb-5 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<FileDocument width={24} height={24} />
						<h1 className="font-semibold text-lg">直近の課題</h1>
						{assignments.length > 0 && (
							<span className="rounded bg-blue-100 px-2.5 py-0.5 font-medium text-blue-800 text-xs dark:bg-blue-900 dark:text-blue-200">
								{assignments.length}件
							</span>
						)}
					</div>
					<div className="flex items-center gap-2">
						<DefaultSelect
							items={["3日以内", "7日以内"]}
							value={selectedPeriod}
							onValueChange={setSelectedPeriod}
						/>
						<DefaultButton aria-label="settings" isIconOnly size="sm">
							<Settings width={20} height={20} />
						</DefaultButton>
					</div>
				</div>

				{assignments.length > 0 ? (
					<div className="max-h-[320px] space-y-3 overflow-y-auto">
						{assignments.map((assignment) => (
							<div
								key={assignment.id}
								className="cursor-pointer rounded-lg border bg-gradient-to-r from-white to-orange-50/50 p-3 transition-all hover:border-orange-300 hover:shadow-md dark:border-gray-700 dark:from-gray-800 dark:to-orange-900/30 dark:hover:border-orange-600"
							>
								<div className="flex items-start justify-between gap-3">
									<div className="flex-1">
										<div className="mb-1 flex items-center gap-2">
											<span className="text-sm">
												{getTypeIcon(assignment.type)}
											</span>
											<h3 className="font-semibold text-gray-900 text-sm dark:text-gray-100">
												{assignment.title}
											</h3>
										</div>

										{assignment.description && (
											<p className="mb-1 line-clamp-2 text-gray-600 text-xs dark:text-gray-400">
												{assignment.description}
											</p>
										)}

										<div className="flex items-center gap-3 text-gray-500 text-xs dark:text-gray-400">
											<span>{assignment.courseName}</span>
											<span>•</span>
											<span
												className={`font-medium ${
													new Date() > assignment.dueDate
														? "text-red-600 dark:text-red-400"
														: "text-gray-600 dark:text-gray-400"
												}`}
											>
												{getDaysUntilDue(assignment.dueDate)}
											</span>
										</div>
									</div>

									<div className="flex flex-col items-end gap-1">
										<span
											className={`rounded-full border px-2 py-0.5 font-medium text-xs ${getPriorityColor(assignment.priority)}`}
										>
											{assignment.priority === "high"
												? "高"
												: assignment.priority === "medium"
													? "中"
													: "低"}
											優先度
										</span>
									</div>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="relative py-12 text-center">
						<div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-orange-50/30 dark:from-gray-800/50 dark:to-orange-900/30" />
						<div className="relative z-10">
							<FileDocument width={24} height={24} />
							<p className="font-medium text-gray-500 dark:text-gray-400">
								直近の課題はありません
							</p>
							<p className="mt-1 text-gray-400 text-sm dark:text-gray-500">
								他の期間を選択してみてください
							</p>
						</div>
					</div>
				)}
			</div>
		</BaseCard>
	);
}
