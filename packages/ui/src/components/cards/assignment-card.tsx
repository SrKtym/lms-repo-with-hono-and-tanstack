import type { FetchAssignmentsFromUserCoursesReturnType } from "@lms-repo/db/utils/query/assignments";
import {
	DATETIME_FORMAT_CONFIG,
	getFileColor,
	getIconByFormat,
} from "../../lib/utils";
import { BaseCard } from "../cards/base-card";
import { DefaultChip } from "../chip";

// 課題を表示するカードコンポーネント（詳細へのリンク付き）
export function AssignmentCard({
	assignment,
}: {
	assignment: FetchAssignmentsFromUserCoursesReturnType[number];
}) {
	const now = new Date();
	const isOverdue = assignment.dueDate < now;
	const daysUntilDue = Math.ceil(
		(assignment.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
	);

	const Icon = getIconByFormat(assignment.format);

	return (
		<BaseCard className="border border-gray-200 dark:border-gray-700">
			<div className="flex gap-3">
				<div className="mt-1">
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
						<Icon />
					</div>
				</div>

				<div className="flex-1">
					<div className="flex items-start justify-between">
						<div className="flex-1">
							<h3 className="line-clamp-1 font-medium text-gray-900 dark:text-gray-100">
								{assignment.title}
							</h3>
							<div className="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
								<span>
									期限:{" "}
									{assignment.dueDate.toLocaleDateString(
										DATETIME_FORMAT_CONFIG.DEFAULT.defaultLocale,
										DATETIME_FORMAT_CONFIG.DEFAULT.options,
									)}
								</span>
								{isOverdue && (
									<span className="text-danger font-medium">期限切れ</span>
								)}
								{!isOverdue && daysUntilDue <= 3 && (
									<span className="text-warning font-medium">
										{daysUntilDue === 0 ? "今日まで" : `残り${daysUntilDue}日`}
									</span>
								)}
							</div>
						</div>

						<DefaultChip size="sm" color={getFileColor(assignment.format)}>
							{assignment.format}
						</DefaultChip>
					</div>

					{assignment.description && (
						<div className="mt-3">
							<p className="line-clamp-1 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
								{assignment.description}
							</p>
						</div>
					)}

					{assignment.points >= 0 && (
						<div className="mt-2 flex items-center gap-2">
							<span className="text-sm text-gray-500 dark:text-gray-400">
								配点:
							</span>
							<span className="font-medium text-gray-900 dark:text-gray-100">
								{assignment.points}点
							</span>
						</div>
					)}
				</div>
			</div>
		</BaseCard>
	);
}
