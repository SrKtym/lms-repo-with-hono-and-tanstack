import { TextArea } from "@heroui/react";
import type { FetchAssignmentsFromUserCoursesReturnType } from "@lms-repo/db/utils/query/assignments";
import type { FetchSubmissionByIdReturnType } from "@lms-repo/db/utils/query/submissions";
import { BaseCard } from "../cards/base-card";
import { DefaultChip } from "../chip";
import { TabsForSubmissions } from "../tabs";
import { FileUploaderCard } from "./file-uploader-card";

interface SubmissionsCardProps {
	targetAssignment: FetchAssignmentsFromUserCoursesReturnType[number];
	targetSubmission?: FetchSubmissionByIdReturnType[number];
	// attachments: AttachmentData[];
	// selectedTab: AssignmentTabKey;
	submitState: any;
	isPending: boolean;
	// onTabChange: (key: AssignmentTabKey) => void;
	onFileRemove: (fileId: string, relatedTo: any) => void;
	formAction: any;
}

export function SubmissionsCard({
	targetAssignment,
	targetSubmission,
	// attachments,
	// selectedTab,
	submitState,
	isPending,
	// onTabChange,
	onFileRemove,
}: SubmissionsCardProps) {
	return (
		<BaseCard className="border border-divider">
			<div className="p-6">
				<div className="flex items-center justify-between">
					<h2 className="font-medium text-lg">{targetAssignment.title}</h2>
					<DefaultChip
						color={
							targetSubmission?.status === "Evaluated"
								? "success"
								: targetSubmission?.status === "Submitted"
									? "accent"
									: "warning"
						}
					>
						未提出
					</DefaultChip>
				</div>

				<div className="mt-4">
					<div className="space-y-2">
						<TabsForSubmissions
							textTab={
								<form className="form-container max-w-3xl">
									<TextArea
										name="content"
										fullWidth
										maxLength={2000}
										rows={10}
										placeholder="最大2000文字まで入力できます。"
										aria-describedby="content-error"
									/>
								</form>
							}
							attachmentsTab={
								<form className="form-container max-w-3xl">
									<FileUploaderCard
										maxFiles={10}
										accept="*/*"
										onFilesChange={() => {}}
										onFileUpload={() => {}}
									/>
								</form>
							}
						/>
					</div>
				</div>
			</div>
		</BaseCard>
	);
}
