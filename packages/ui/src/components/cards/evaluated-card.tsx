import { BaseCard } from "../cards/base-card";
import { DefaultChip } from "../chip";

// Type definitions
interface Submission {
	id: string;
	title: string;
	status: string;
	grade?: number;
	submittedAt?: Date;
	gradedAt?: Date;
}

interface EvaluatedCardProps {
	submissions: Submission[];
	isTeacher: boolean;
	dateOptionforAnnouncement: Intl.DateTimeFormatOptions;
}

// EvaluatedCard component
export function EvaluatedCard({
	submissions,
	isTeacher,
	dateOptionforAnnouncement,
}: EvaluatedCardProps) {
	return (
		<BaseCard className="border border-divider">
			<div className="p-6">
				<h2 className="mb-4 font-medium text-lg">
					{isTeacher ? "Evaluated Submissions" : "Evaluated Assignments"}
				</h2>
				<div className="space-y-4">
					{submissions.map((submission) => (
						<div
							key={submission.id}
							className="border-divider border-b pb-4 last:border-b-0"
						>
							<div className="flex items-start justify-between">
								<div className="flex-1">
									<h3 className="font-medium text-gray-900 dark:text-gray-100">
										{submission.title}
									</h3>
									<div className="mt-1 space-y-1">
										<p className="text-default-500 text-sm">
											Status:{" "}
											<span className="font-medium">{submission.status}</span>
										</p>
										{submission.submittedAt && (
											<p className="text-default-500 text-sm">
												Submitted:{" "}
												{submission.submittedAt.toLocaleDateString(
													"default",
													dateOptionforAnnouncement,
												)}
											</p>
										)}
										{submission.gradedAt && (
											<p className="text-default-500 text-sm">
												Graded:{" "}
												{submission.gradedAt.toLocaleDateString(
													"default",
													dateOptionforAnnouncement,
												)}
											</p>
										)}
									</div>
								</div>
								{submission.grade !== undefined && (
									<div className="text-right">
										<DefaultChip size="sm" color="success">
											{submission.grade} points
										</DefaultChip>
									</div>
								)}
							</div>
						</div>
					))}
					{submissions.length === 0 && (
						<p className="py-8 text-center text-default-500">
							No evaluated submissions
						</p>
					)}
				</div>
			</div>
		</BaseCard>
	);
}
