import { BaseCard } from "../cards/base-card";
import { DefaultChip } from "../chip";

// Type definitions
interface AssignmentStatusCardProps {
	currentAssignment: {
		dueDate: Date;
		points?: number;
		assignmentStatus?: {
			status: string;
		};
	} | null;
	isTeacher?: boolean;
	dateOptionforAnnouncement?: Intl.DateTimeFormatOptions;
	getAssignmentStatusColor?: (
		status: string,
	) => "default" | "success" | "warning" | "danger" | "accent";
}

// AssignmentStatusCard component
export function AssignmentStatusCard({
	currentAssignment,
	isTeacher = false,
	dateOptionforAnnouncement = {
		year: "numeric",
		month: "short",
		day: "numeric",
	},
	getAssignmentStatusColor = () => "default",
}: AssignmentStatusCardProps) {
	return (
		<BaseCard className="border border-divider">
			<div className="p-6">
				<h2 className="mb-3 font-medium text-lg">
					{isTeacher ? " メンバーの提出状況" : "提出状況"}
				</h2>
				<div className="space-y-6">
					{currentAssignment && (
						<div className="space-y-2">
							{/* Due date */}
							<p className="mb-1 text-default-500 text-sm">期限</p>
							<p className="ml-3 font-medium text-sm">
								{currentAssignment.dueDate.toLocaleDateString(
									"default",
									dateOptionforAnnouncement,
								)}
							</p>

							{/* Student submission status */}
							{!isTeacher && currentAssignment.assignmentStatus && (
								<div>
									<p className="mb-1 text-default-500 text-sm">
										{isTeacher ? "メンバーの提出状況" : "提出状況"}
									</p>
									<DefaultChip
										size="sm"
										className="ml-3"
										color={getAssignmentStatusColor(
											currentAssignment.assignmentStatus.status,
										)}
									>
										{currentAssignment.assignmentStatus.status}
									</DefaultChip>
								</div>
							)}

							{/* Teacher submission progress */}
							{isTeacher && (
								<div>
									<p className="mb-1 text-default-500 text-sm">
										メンバーの提出状況
									</p>
									<div className="ml-3 flex items-center gap-2">
										<div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
											<div className="h-full w-1/2 rounded-full bg-primary" />
										</div>
										<span className="text-sm">1/2</span>
									</div>
								</div>
							)}

							{/* Points */}
							<div>
								<p className="mb-1 text-default-500 text-sm">点</p>
								<p className="ml-3 font-medium text-sm">
									{currentAssignment?.points} 点
								</p>
							</div>
						</div>
					)}
				</div>
			</div>
		</BaseCard>
	);
}
