import { FileText } from "../../assets/icons/file-text";
import { BaseCard } from "../cards/base-card";
import { DefaultChip } from "../chip";
import { DefaultSeparator } from "../separator";

// Type definitions
interface AttachmentMetaData {
	id: string;
	name: string;
	type: string;
}

interface AssignmentDetailCardProps {
	currentAssignment: {
		title: string;
		createdAt: Date;
		points?: number;
		dueDate: Date;
		description?: string;
		attachmentMetaData: AttachmentMetaData[];
		type?: string;
	} | null;
	isTeacher?: boolean;
	dateOptionforAnnouncement?: Intl.DateTimeFormatOptions;
	getFileColor?: (
		type: string,
	) => "default" | "success" | "warning" | "danger" | "accent";
}

// AssignmentDetailCard component
export function AssignmentDetailCard({
	currentAssignment,
	isTeacher = false,
	dateOptionforAnnouncement = {
		year: "numeric",
		month: "short",
		day: "numeric",
	},
}: AssignmentDetailCardProps) {
	if (!currentAssignment) return null;

	return (
		<BaseCard className="border border-divider">
			<div className="p-6">
				<div className="flex items-start justify-between">
					<div className="flex gap-4">
						<div className="mt-1">
							<div className="flex h-12 w-12 items-center justify-center rounded-full bg-content2">
								{currentAssignment.type && <FileText />}
							</div>
						</div>
						<div className="space-y-2">
							<h1 className="font-medium text-2xl">
								{currentAssignment.title}
							</h1>
							<span>
								{currentAssignment.createdAt.toLocaleDateString(
									"default",
									dateOptionforAnnouncement,
								)}
							</span>
							{currentAssignment.points && (
								<div className="mt-2">
									<DefaultChip size="sm" color="accent">
										{currentAssignment.points} 点
									</DefaultChip>
								</div>
							)}
						</div>
					</div>
				</div>

				{isTeacher && (
					<div className="absolute top-6 right-6">
						{/* Edit button placeholder */}
					</div>
				)}

				<DefaultSeparator className="my-6" />

				<div className="mb-6">
					<div className="mb-1 flex items-center gap-2">
						{/* CalendarClock icon placeholder */}
						<span className="font-medium">期限</span>
					</div>
					<p className="ml-6 text-default-600">
						{currentAssignment.dueDate.toLocaleDateString()}
					</p>
				</div>

				<div className="mb-6">
					<div className="mb-2 flex items-center gap-2">
						{/* ArrowLeft icon placeholder */}
						<span className="font-medium">説明</span>
					</div>
					<div className="prose prose-sm ml-6 max-w-none text-default-600">
						<p className="whitespace-pre-line">
							{currentAssignment.description}
						</p>
					</div>
				</div>

				<div className="mb-6">
					<div className="mb-2 flex items-center gap-2">
						{/* PaperClip icon placeholder */}
						<span className="font-medium">添付ファイル</span>
					</div>
					<div className="ml-6 space-y-2">
						{currentAssignment.attachmentMetaData.map((metaData) => (
							<BaseCard key={metaData.id} className="border border-divider">
								<div className="flex items-center gap-3 p-3">
									<div className="flex h-10 w-10 items-center justify-center rounded-md bg-content2">
										<FileText width={20} height={20} />
									</div>
									<div className="min-w-0 flex-1">
										<p className="truncate font-medium">{metaData.name}</p>
										<p className="text-default-500 text-xs capitalize">
											{metaData.type}
										</p>
									</div>
									{/* DefaultButton placeholder */}
									<span className="text-sm">開く</span>
								</div>
							</BaseCard>
						))}
					</div>
				</div>
			</div>
		</BaseCard>
	);
}
