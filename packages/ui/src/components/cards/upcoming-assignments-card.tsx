import type { FetchAssignmentsFromUserCoursesReturnType } from "@lms-repo/db/utils/query/assignments";
import { FileDocument } from "@lms-repo/ui/assets/icons/file-document";
import { FileText } from "@lms-repo/ui/assets/icons/file-text";
import { MSExcel } from "@lms-repo/ui/assets/icons/ms-excel";
import { MSPowerpoint } from "@lms-repo/ui/assets/icons/ms-powerpoint";
import { MSword } from "@lms-repo/ui/assets/icons/ms-word";
import { PDFFile } from "@lms-repo/ui/assets/icons/pdf-file";
import { Settings } from "@lms-repo/ui/assets/icons/settings";
import { useState } from "react";
import { DefaultButton } from "../button";
import { DefaultSelect } from "../select";
import { BaseCard } from "./base-card";

export function UpcomingAssignmentsCard({
	assignments,
}: {
	assignments: FetchAssignmentsFromUserCoursesReturnType;
}) {
	const [selectedPeriod, setSelectedPeriod] = useState("7日以内");

	const filteredAssignments = assignments.filter(
		(assignment) =>
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

	const getTypeIcon = (format: string) => {
		switch (format) {
			case "powerpoint":
				return <MSPowerpoint />;
			case "pdf":
				return <PDFFile />;
			case "excel":
				return <MSExcel />;
			case "word":
				return <MSword />;
			default:
				return <FileText />;
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
												{getTypeIcon(assignment.format)}
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
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="relative py-12 text-center">
						<div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-orange-50/30 dark:from-gray-800/50 dark:to-orange-900/30" />
						<div className="relative z-10">
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
