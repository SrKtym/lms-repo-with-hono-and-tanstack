import { TrendingUp } from "@lms-repo/ui/assets/icons/trending-up";
import { BaseCard } from "../cards/base-card";
import { DefaultProgressBar } from "../progress-bar";

// Mock assignment data
const mockAssignments = [
	{
		id: 1,
		title: "Data Structures Report",
		course: "Data Structures and Algorithms",
		status: "Submitted",
		submittedDate: new Date("2024-04-01T10:30:00"),
		dueDate: new Date("2024-04-05T23:59:59"),
		grade: 85,
	},
	{
		id: 2,
		title: "Web Development Assignment",
		course: "Web Development Fundamentals",
		status: "Not Submitted",
		submittedDate: null,
		dueDate: new Date("2024-04-08T23:59:59"),
		grade: null,
	},
	{
		id: 3,
		title: "AI Paper Summary",
		course: "Artificial Intelligence",
		status: "Submitted",
		submittedDate: new Date("2024-04-03T15:45:00"),
		dueDate: new Date("2024-04-10T23:59:59"),
		grade: 92,
	},
	{
		id: 4,
		title: "Algorithm Implementation Test",
		course: "Data Structures and Algorithms",
		status: "Under Review",
		submittedDate: new Date("2024-04-05T09:15:00"),
		dueDate: new Date("2024-04-12T23:59:59"),
		grade: null,
	},
	{
		id: 5,
		title: "React Project",
		course: "Web Development Fundamentals",
		status: "Not Started",
		submittedDate: null,
		dueDate: new Date("2024-04-15T23:59:59"),
		grade: null,
	},
];

export function AssignmentsProgressCard() {
	// Analyze assignment data
	const totalAssignments = mockAssignments.length;
	const submittedAssignments = mockAssignments.filter(
		(assignment) => assignment.status === "Submitted",
	);
	const inProgressAssignments = mockAssignments.filter(
		(assignment) => assignment.status === "Under Review",
	);
	const notStartedAssignments = mockAssignments.filter(
		(assignment) => assignment.status === "Not Started",
	);
	const overdueAssignments = mockAssignments.filter(
		(assignment) =>
			assignment.status === "Not Submitted" && new Date() > assignment.dueDate,
	);

	const submittedCount = submittedAssignments.length;
	const inProgressCount = inProgressAssignments.length;
	const notStartedCount = notStartedAssignments.length;
	const overdueCount = overdueAssignments.length;

	const completionRate =
		totalAssignments > 0
			? Math.round((submittedCount / totalAssignments) * 100)
			: 0;
	const averageGrade =
		submittedAssignments.length > 0
			? Math.round(
					submittedAssignments.reduce((sum, a) => sum + (a.grade || 0), 0) /
						submittedAssignments.length,
				)
			: 0;

	return (
		<BaseCard className="relative overflow-hidden border-0 bg-gradient-to-br from-white to-green-50/30 p-5 shadow-lg backdrop-blur-sm dark:from-gray-800 dark:to-green-900/20">
			{/* Decorative background elements */}
			<div className="absolute -top-16 -right-16 h-32 w-32 rounded-full bg-gradient-to-br from-green-400/10 to-emerald-400/10 blur-2xl" />
			<div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-gradient-to-tr from-emerald-400/10 to-green-400/10 blur-xl" />

			<div className="relative z-10 space-y-5">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div className="text-green-600">
							<TrendingUp width={24} height={24} />
						</div>
						<h2 className="font-semibold text-gray-900 text-lg dark:text-gray-100">
							課題進行状況
						</h2>
					</div>
					<div className="text-right">
						<div className="font-bold text-blue-600 text-xl dark:text-blue-400">
							{completionRate}%
						</div>
						<div className="text-gray-600 text-xs dark:text-gray-400">
							達成率
						</div>
					</div>
				</div>

				{/* Progress bar */}
				<div className="space-y-2">
					<div className="flex justify-between text-gray-600 text-xs dark:text-gray-400">
						<span>全体の進捗</span>
						<span>
							{submittedCount} / {totalAssignments} assignments
						</span>
					</div>
					<DefaultProgressBar value={completionRate} />
				</div>

				{/* Statistics cards */}
				<div className="grid grid-cols-2 gap-3">
					<div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950">
						<div className="font-bold text-green-600 text-lg dark:text-green-400">
							{submittedCount}
						</div>
						<div className="text-green-700 text-xs dark:text-green-300">
							提出済み
						</div>
					</div>

					<div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950">
						<div className="font-bold text-blue-600 text-lg dark:text-blue-400">
							{inProgressCount}
						</div>
						<div className="text-blue-700 text-xs dark:text-blue-300">
							評定中
						</div>
					</div>

					<div className="rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-800 dark:bg-orange-950">
						<div className="font-bold text-lg text-orange-600 dark:text-orange-400">
							{notStartedCount}
						</div>
						<div className="text-orange-700 text-xs dark:text-orange-300">
							未着手
						</div>
					</div>

					<div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950">
						<div className="font-bold text-lg text-red-600 dark:text-red-400">
							{overdueCount}
						</div>
						<div className="text-red-700 text-xs dark:text-red-300">
							期限切れ
						</div>
					</div>
				</div>

				{/* Average grade and recent submission */}
				<div className="grid grid-cols-1 gap-3">
					<div className="rounded-lg border border-purple-200 bg-purple-50 p-3 dark:border-purple-800 dark:bg-purple-950">
						<div className="mb-1 text-purple-700 text-xs dark:text-purple-300">
							平均評価点
						</div>
						<div className="font-bold text-2xl text-purple-600 dark:text-purple-400">
							{averageGrade}
						</div>
					</div>

					<div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-950">
						<div className="mb-1 text-gray-700 text-xs dark:text-gray-300">
							最近の提出
						</div>
						<div className="font-medium text-gray-900 text-xs dark:text-gray-100">
							{submittedAssignments.length > 0
								? submittedAssignments[submittedAssignments.length - 1]
										?.title || "タイトルなし"
								: "提出済みの課題はありません"}
						</div>
					</div>
				</div>
			</div>
		</BaseCard>
	);
}
