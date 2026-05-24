import type { FetchAssignmentsFromUserCoursesReturnType } from "@lms-repo/db/utils/query/assignments";
import type { FetchSubmissionsFromUserCoursesReturnType } from "@lms-repo/db/utils/query/submissions";
import { ArrowLeft } from "@lms-repo/ui/assets/icons/arrow-left";
import { CancelButton } from "@lms-repo/ui/components/button";
import { AssignmentDetailCard } from "@lms-repo/ui/components/cards/assignment-detail-card";
import { CommentsCard } from "@lms-repo/ui/components/cards/comments-card";
import { SubmissionsCard } from "@lms-repo/ui/components/cards/submissions-card";
import { Link } from "@tanstack/react-router";
import { domAnimation, LazyMotion } from "motion/react";
import * as m from "motion/react-m";
import { useState } from "react";
import { useCommentsWithAssignment } from "@/hooks/comments";
import { CreateCommentForm } from "./create-comment-form";

const mockAttachments = [
	{ id: "file-1", name: "report.pdf", size: "2.5MB", type: "application/pdf" },
];

interface RegisteredCourseContentsProps {
	targetAssignment?: FetchAssignmentsFromUserCoursesReturnType[number];
	submission?: FetchSubmissionsFromUserCoursesReturnType[number];
	assignmentId: string;
}

export default function RegisteredCourseContents({
	targetAssignment,
	submission,
	assignmentId,
}: RegisteredCourseContentsProps) {
	if (!targetAssignment) {
		return <div>課題が見つかりません。</div>;
	}
	const [submitState, setSubmitState] = useState<
		"idle" | "submitting" | "submitted"
	>("idle");
	const [isPending, setIsPending] = useState(false);
	const [attachments, setAttachments] = useState(mockAttachments);
	const { data: comments = [] } = useCommentsWithAssignment(assignmentId);

	const propaties = {
		initial: { opacity: 0, y: 10 },
		animate: { opacity: 1, y: 0 },
		transition: { duration: 0.3 },
	};

	const onFileRemove = (fileId: string) => {
		setAttachments(attachments.filter((file) => file.id !== fileId));
	};

	const formAction = async () => {
		setIsPending(true);
		// モック: 提出処理
		setTimeout(() => {
			setSubmitState("submitted");
			setIsPending(false);
		}, 2000);
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
						{targetAssignment && (
							<div className="text-sm text-white opacity-80">
								{targetAssignment.courseName} / 課題の詳細
							</div>
						)}
					</div>
				</div>
			</div>

			<div className="container m-auto max-w-screen-xl px-4">
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
					<LazyMotion features={domAnimation}>
						{/* 課題の詳細 */}
						<m.div {...propaties} className="lg:col-span-2">
							<AssignmentDetailCard targetAssignment={targetAssignment} />
						</m.div>

						{/* 提出（学生用） */}
						<m.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: 0.1 }}
						>
							<SubmissionsCard
								targetAssignment={targetAssignment}
								targetSubmission={submission}
								// attachments={attachments}
								// selectedTab={selectedTab}
								submitState={submitState}
								isPending={isPending}
								// onTabChange={onTabChange}
								onFileRemove={onFileRemove}
								formAction={formAction}
							/>
						</m.div>

						{/* コメント */}
						<m.div
							{...propaties}
							transition={{ ...propaties.transition, delay: 0.2 }}
						>
							<CommentsCard comments={comments}>
								<CreateCommentForm />
							</CommentsCard>
						</m.div>
					</LazyMotion>
				</div>
			</div>
		</div>
	);
}
