import { ArrowLeft } from "@lms-repo/ui/assets/icons/arrow-left";
import { CancelButton, DefaultButton } from "@lms-repo/ui/components/button";
import { AssignmentDetailCard } from "@lms-repo/ui/components/cards/assignment-detail-card";
import { AssignmentStatusCard } from "@lms-repo/ui/components/cards/assignment-status-card";
import { CommentsCard } from "@lms-repo/ui/components/cards/comments-card";
import { EvaluatedCard } from "@lms-repo/ui/components/cards/evaluated-card";
import { SubmissionsCard } from "@lms-repo/ui/components/cards/submissions-card";
import { Link } from "@tanstack/react-router";
import { domAnimation, LazyMotion } from "motion/react";
import * as m from "motion/react-m";
import { useState } from "react";

// モックデータ
const mockCurrentAssignment = {
	id: "assignment-1",
	title: "マクロ経済学レポート",
	description: "マクロ経済学の基本概念についてレポートを作成してください。",
	points: 100,
	dueDate: new Date("2024-12-01"),
	format: "PDF",
	createdAt: new Date("2024-11-01"),
	updatedAt: new Date("2024-11-01"),
	createdBy: "professor-1",
	courseName: "マクロ経済学",
	// AssignmentDetailCard 用
	attachmentMetaData: [
		{ id: "file-1", name: "assignment-guide.pdf", type: "application/pdf" },
		{
			id: "file-2",
			name: "sample-report.docx",
			type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		},
	],
	type: "assignment",
	// AssignmentStatusCard 用
	assignmentStatus: { status: "submitted" },
};

const mockDateOptionforAnnouncement: Intl.DateTimeFormatOptions = {
	year: "numeric",
	month: "long",
	day: "numeric",
	hour: "2-digit",
	minute: "2-digit",
};

const mockAttachments = [
	{ id: "file-1", name: "report.pdf", size: "2.5MB", type: "application/pdf" },
];

const mockSubmissionData = [
	{
		id: "submission-1",
		title: "マクロ経済学レポート",
		status: "graded",
		grade: 85,
		submittedAt: new Date("2024-11-25"),
		gradedAt: new Date("2024-11-28"),
	},
	{
		id: "submission-2",
		title: "ミクロ経済学課題",
		status: "submitted",
		submittedAt: new Date("2024-11-26"),
	},
];

const mockComments = [
	{
		id: "comment-1",
		content:
			"レポートの提出期限が近づいています。質問があればお知らせください。",
		createdAt: new Date("2024-11-20"),
		createdBy: "professor-1",
		userName: "教授A",
	},
	{
		id: "comment-2",
		content: "図表の追加について相談したいです。",
		createdAt: new Date("2024-11-22"),
		createdBy: "student-1",
		userName: "学生B",
	},
];

const mockUserData = {
	id: "student-1",
	name: "学生B",
};

const mockOtherAssignments = [
	{
		id: "assignment-2",
		title: "ミクロ経済学課題",
		dueDate: new Date("2024-12-05"),
		points: 50,
	},
	{
		id: "assignment-3",
		title: "統計学レポート",
		dueDate: new Date("2024-12-10"),
		points: 75,
	},
];

export default function RegisteredCourseContents() {
	const isTeacher = false;
	const [selectedTab, setSelectedTab] = useState<"text" | "file">("text");
	const [submitState, setSubmitState] = useState<
		"idle" | "submitting" | "submitted"
	>("idle");
	const [isPending, setIsPending] = useState(false);
	const [attachments, setAttachments] = useState(mockAttachments);
	const [comment, setComment] = useState("");
	const [comments, setComments] = useState(mockComments);

	const propaties = {
		initial: { opacity: 0, y: 10 },
		animate: { opacity: 1, y: 0 },
		transition: { duration: 0.3 },
	};

	const currentAssignment = mockCurrentAssignment;
	const dateOptionforAnnouncement = mockDateOptionforAnnouncement;
	const submissionData = mockSubmissionData;
	const filteredComments = comments;
	const userData = mockUserData;
	const OtherAssignmentList = mockOtherAssignments;

	const onTabChange = (tab: "text" | "file") => {
		setSelectedTab(tab);
	};

	const onFileRemove = (fileId: string) => {
		setAttachments(attachments.filter((file) => file.id !== fileId));
	};

	const formAction = async (formData: FormData) => {
		setIsPending(true);
		// モック: 提出処理
		setTimeout(() => {
			setSubmitState("submitted");
			setIsPending(false);
		}, 2000);
	};

	const getAssignmentStatusColor = (status: string) => {
		switch (status) {
			case "submitted":
				return "success";
			case "overdue":
				return "danger";
			default:
				return "warning";
		}
	};

	const handleAddComment = () => {
		if (comment.trim()) {
			const newComment = {
				id: `comment-${Date.now()}`,
				content: comment,
				createdAt: new Date(),
				createdBy: userData.id,
				userName: userData.name,
			};
			setComments([...comments, newComment]);
			setComment("");
		}
	};

	return (
		<div className="space-y-8 bg-background pb-12">
			{/* ヘッダー */}
			<div className="relative flex h-24 items-end bg-primary">
				<div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
				<div className="container relative z-10 mx-auto max-w-screen-xl px-4 py-4">
					<div className="flex items-center space-x-4">
						<Link
							to="/course-list/{-$course-id}/{-$content-id}"
							params={(prev) => ({ ...prev, "content-id": undefined })}
							className="flex items-center gap-1"
						>
							<CancelButton size="sm">
								<ArrowLeft />
								戻る
							</CancelButton>
						</Link>
						{currentAssignment && (
							<div className="text-sm text-white opacity-80">
								{currentAssignment.courseName} / 課題の詳細
							</div>
						)}
					</div>
				</div>
			</div>

			<div className="container m-auto max-w-screen-xl px-4">
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
					<LazyMotion features={domAnimation}>
						{/* 課題の詳細 */}
						{currentAssignment && (
							<div className="space-y-6 lg:col-span-2">
								<m.div {...propaties}>
									<AssignmentDetailCard
										currentAssignment={currentAssignment}
										isTeacher={isTeacher}
										dateOptionforAnnouncement={dateOptionforAnnouncement}
									/>
								</m.div>
							</div>
						)}

						{/* 提出（学生用） */}
						{!isTeacher && currentAssignment && (
							<m.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3, delay: 0.1 }}
							>
								<SubmissionsCard
									currentAssignment={currentAssignment}
									attachments={attachments}
									selectedTab={selectedTab}
									submitState={submitState}
									isPending={isPending}
									onTabChange={onTabChange}
									onFileRemove={onFileRemove}
									formAction={formAction}
								/>
							</m.div>
						)}

						{/* 評定（教員用） */}
						{isTeacher && submissionData && (
							<m.div
								{...propaties}
								transition={{ ...propaties.transition, delay: 0.1 }}
							>
								<EvaluatedCard
									submissions={submissionData}
									isTeacher={isTeacher}
									dateOptionforAnnouncement={dateOptionforAnnouncement}
								/>
							</m.div>
						)}

						{/* コメント */}
						<m.div
							{...propaties}
							transition={{ ...propaties.transition, delay: 0.2 }}
						>
							<CommentsCard
								comments={filteredComments}
								userData={userData}
								comment={comment}
								onCommentChange={(e) => setComment(e.target.value)}
								isTeacher={isTeacher}
								dateOptionforAnnouncement={dateOptionforAnnouncement}
							/>
						</m.div>

						{/* 課題の提出状況 */}
						<m.div
							{...propaties}
							transition={{ ...propaties.transition, delay: 0.3 }}
						>
							<AssignmentStatusCard
								currentAssignment={currentAssignment}
								isTeacher={isTeacher}
								dateOptionforAnnouncement={dateOptionforAnnouncement}
								getAssignmentStatusColor={getAssignmentStatusColor}
							/>
						</m.div>

						{/* その他の課題 */}
						<m.div
							{...propaties}
							transition={{ ...propaties.transition, delay: 0.2 }}
						>
							{/* 改良: その他の課題を表示（モック） */}
							<div className="rounded-lg border bg-card p-6 shadow-sm">
								<h3 className="mb-4 font-semibold text-lg">その他の課題</h3>
								<div className="space-y-2">
									{OtherAssignmentList.map((assignment) => (
										<div
											key={assignment.id}
											className="flex items-center justify-between rounded border p-3"
										>
											<div>
												<p className="font-medium">{assignment.title}</p>
												<p className="text-muted-foreground text-sm">
													期限: {assignment.dueDate.toLocaleDateString()} |{" "}
													{assignment.points}点
												</p>
											</div>
											<DefaultButton size="sm" variant="outline">
												詳細
											</DefaultButton>
										</div>
									))}
								</div>
							</div>
						</m.div>
					</LazyMotion>
				</div>
			</div>
		</div>
	);
}
