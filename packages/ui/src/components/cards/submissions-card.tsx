import { Tab, Tabs, TextArea } from "@heroui/react";
import type {
	AssignmentTabKey,
	AttachmentData,
} from "@lms-repo/types/main/regisered-course";
import { DefaultButton } from "../button";
import { BaseCard } from "../cards/base-card";
import { DefaultChip } from "../chip";
import { TabsForSubmissions } from "../tabs";
import { FileUploaderCard } from "./file-uploader-card";

interface Assignment {
	id: string;
	assignmentStatus?: {
		status: string;
	};
}

interface SubmissionsCardProps {
	currentAssignment: Assignment;
	attachments: AttachmentData[];
	selectedTab: AssignmentTabKey;
	submitState: any;
	isPending: boolean;
	onTabChange: (key: AssignmentTabKey) => void;
	onFileRemove: (fileId: string, relatedTo: any) => void;
	formAction: any;
}

export function SubmissionsCard({
	currentAssignment,
	attachments,
	selectedTab,
	submitState,
	isPending,
	onTabChange,
	onFileRemove,
}: SubmissionsCardProps) {
	const options = ["テキストで提出", "ファイルで提出"];

	return (
		<BaseCard className="border border-divider">
			<div className="p-6">
				<div className="flex items-center justify-between">
					<h2 className="font-medium text-lg">{currentAssignment.id}</h2>
					<DefaultChip
						color={
							currentAssignment.assignmentStatus?.status === "Evaluated"
								? "success"
								: currentAssignment.assignmentStatus?.status === "Submitted"
									? "accent"
									: "warning"
						}
					>
						{currentAssignment.assignmentStatus?.status}
					</DefaultChip>
				</div>

				<div className="mt-4">
					<div className="space-y-2">
						<TabsForSubmissions
							options={options}
							textTab={
								<form className="form-container max-w-3xl">
									<TextArea
										name="content"
										fullWidth
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
