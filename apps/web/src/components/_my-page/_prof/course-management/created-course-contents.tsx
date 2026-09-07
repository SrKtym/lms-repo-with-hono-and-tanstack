import type { FetchAssignmentsFromUserCoursesReturnType } from "@lms-repo/db/utils/query/assignments";
import { ArrowLeft } from "@lms-repo/ui/assets/icons/arrow-left";
import { CancelButton } from "@lms-repo/ui/components/button";
import { AssignmentDetailCard } from "@lms-repo/ui/components/cards/assignment-detail-card";
import { CommentsCard } from "@lms-repo/ui/components/cards/comments-card";
import { EvaluatedCard } from "@lms-repo/ui/components/cards/evaluated-card";
import { LazyMotionProvider } from "@lms-repo/ui/components/lazymotion-provider";
import { ControlledModal } from "@lms-repo/ui/components/modals/controlled-modal";
import { toast } from "@lms-repo/ui/components/toast";
import { Link } from "@tanstack/react-router";
import * as m from "motion/react-m";
import { Fragment, useEffect, useState } from "react";
import { CreateCommentForm } from "@/components/_my-page/shared/create-comment-form";
import { useCommentsWithAssignment } from "@/hooks/comments";
import {
	useAllSubmissionsWithStudents,
	useDownloadUrl,
	useGradeSubmission,
} from "@/hooks/submissions";

interface CreatedCourseContentsProps {
	targetAssignment?: FetchAssignmentsFromUserCoursesReturnType[number];
	assignmentId: string;
}

export default function CreatedCourseContents({
	targetAssignment,
	assignmentId,
}: CreatedCourseContentsProps) {
	const propaties = {
		initial: { opacity: 0, y: 10 },
		animate: { opacity: 1, y: 0 },
		transition: { duration: 0.3 },
	};

	const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
	const [selectedTextSubmissionId, setSelectedTextSubmissionId] = useState<
		string | null
	>(null);
	const [isTextModalOpen, setIsTextModalOpen] = useState(false);

	// コメントの取得
	const { data: comments = [] } = useCommentsWithAssignment(assignmentId);

	// すべての提出物を取得
	const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
		useAllSubmissionsWithStudents(assignmentId);

	const { mutate: gradeSubmission } = useGradeSubmission();

	// 採点処理
	const handleGradeSubmission = (
		userId: string,
		assignmentId: string,
		score: number,
	) => {
		gradeSubmission(
			{ userId, assignmentId, score },
			{
				onSuccess: (data) => {
					if ("error" in data) {
						toast.danger(data.error);
					}
					toast.success("採点が完了しました");
				},
				onError: (error) => {
					toast.danger("採点に失敗しました", {
						description: error.message,
					});
				},
			},
		);
	};

	const allSubmissions = data?.pages.flat() || [];

	// ファイルIDを取得
	const handleDownloadFile = (fileId: string) => {
		setSelectedFileId(fileId);
	};

	// ファイルダウンロード用の署名付きURLとファイル名を取得
	const { data: downloadData } = useDownloadUrl(selectedFileId ?? "");

	// テキスト提出物を表示
	const handleViewTextSubmission = (submissionId: string) => {
		setSelectedTextSubmissionId(submissionId);
		setIsTextModalOpen(true);
	};

	// ダウンロードURLが取得できたらファイルをダウンロード
	useEffect(() => {
		if (downloadData && "signedUrl" in downloadData) {
			const link = document.createElement("a");
			link.href = downloadData.signedUrl;
			link.download = downloadData.fileName;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			setSelectedFileId(null);
		}
	}, [downloadData]);

	return (
		<div className="space-y-8 pb-12">
			{/* ヘッダー */}
			<div className="assignment-detail-header">
				<div />
				<div>
					<div className="flex items-center space-x-4">
						<Link
							to="/course-management"
							search={(prev) => ({ ...prev, "assignment-id": undefined })}
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

			<div className="assignment-detail-content">
				<div className="grid grid-cols-1 gap-6">
					<LazyMotionProvider>
						{/* 課題の詳細 */}
						<m.div {...propaties}>
							<AssignmentDetailCard targetAssignment={targetAssignment} />
						</m.div>

						{/* 提出（教員用 - 学生の提出物を表示） */}
						<m.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: 0.1 }}
						>
							<EvaluatedCard
								submissions={allSubmissions}
								isLoading={isLoading}
								hasNextPage={hasNextPage}
								fetchNextPage={() => fetchNextPage()}
								isFetchingNextPage={isFetchingNextPage}
								onViewTextSubmission={handleViewTextSubmission}
								onDownloadFile={handleDownloadFile}
								onGrade={handleGradeSubmission}
							/>
						</m.div>

						{/* コメント */}
						<m.div
							{...propaties}
							transition={{ ...propaties.transition, delay: 0.2 }}
						>
							<CommentsCard comments={comments}>
								<CreateCommentForm assignmentId={assignmentId} />
							</CommentsCard>
						</m.div>
					</LazyMotionProvider>
				</div>
			</div>

			{/* テキスト提出詳細モーダル */}
			<ControlledModal
				isOpen={isTextModalOpen}
				onOpenChange={setIsTextModalOpen}
				heading="テキスト提出詳細"
				size="md"
			>
				<div className="space-y-4">
					{(() => {
						const selectedSubmission = allSubmissions.find(
							({ textSubmission }) =>
								textSubmission?.id === selectedTextSubmissionId,
						);
						if (!selectedSubmission?.textSubmission) {
							return (
								<p className="text-gray-500 dark:text-gray-400">
									提出物が見つかりません
								</p>
							);
						}
						return (
							<Fragment>
								<div>
									<h3 className="font-medium text-gray-900 dark:text-gray-100">
										タイトル
									</h3>
									<p className="mt-1 text-gray-700 dark:text-gray-300">
										{selectedSubmission.textSubmission.title}
									</p>
								</div>
								<div>
									<h3 className="font-medium text-gray-900 dark:text-gray-100">
										説明
									</h3>
									<p className="mt-1 whitespace-pre-wrap text-gray-700 leading-relaxed dark:text-gray-300">
										{selectedSubmission.textSubmission.description}
									</p>
								</div>
							</Fragment>
						);
					})()}
				</div>
			</ControlledModal>
		</div>
	);
}
