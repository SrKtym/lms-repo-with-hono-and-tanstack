import type { FetchAssignmentsFromUserCoursesReturnType } from "@lms-repo/db/utils/query/assignments";
import type { FetchSubmissionsFromUserCoursesReturnType } from "@lms-repo/db/utils/query/submissions";
import { ArrowLeft } from "@lms-repo/ui/assets/icons/arrow-left";
import { CancelButton, DefaultButton } from "@lms-repo/ui/components/button";
import { AssignmentDetailCard } from "@lms-repo/ui/components/cards/assignment-detail-card";
import { CommentsCard } from "@lms-repo/ui/components/cards/comments-card";
import { SubmissionsCard } from "@lms-repo/ui/components/cards/submissions-card";
import type { UploadedFile } from "@lms-repo/ui/components/cards/file-uploader-card";
import { Link } from "@tanstack/react-router";
import { domAnimation, LazyMotion } from "motion/react";
import * as m from "motion/react-m";
import { useState } from "react";
import { useCommentsWithAssignment } from "@/hooks/comments";
import { useSubmitMultipleFiles } from "@/hooks/submissions";
import { CreateCommentForm } from "./create-comment-form";

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
	const [selectedFiles, setSelectedFiles] = useState<UploadedFile[]>([]);
	const { data: comments = [] } = useCommentsWithAssignment(assignmentId);
	const submitMultipleFiles = useSubmitMultipleFiles();

	const propaties = {
		initial: { opacity: 0, y: 10 },
		animate: { opacity: 1, y: 0 },
		transition: { duration: 0.3 },
	};

	const onFileRemove = (fileId: string) => {
		setSelectedFiles(selectedFiles.filter((file) => file.id !== fileId));
	};

	const onFilesChange = (files: UploadedFile[]) => {
		setSelectedFiles(files);
	};

	const onFileUpload = async (_file: File): Promise<string> => {
		// FileUploaderCard の onFileUpload は単一ファイルのアップロードを期待しますが、
		// useSubmitMultipleFiles は複数ファイルを一括処理します。
		// ここではダミーの URL を返し、実際のアップロードは formAction で行います。
		return "dummy-url";
	};

	const formAction = async () => {
		if (selectedFiles.length === 0) {
			alert("ファイルを選択してください");
			return;
		}

		setIsPending(true);
		setSubmitState("submitting");

		try {
			// UploadedFile から File オブジェクトを作成
			const files = selectedFiles.map((uploadedFile) => {
				return new File([uploadedFile.name], uploadedFile.name, {
					type: uploadedFile.type,
				});
			});

			await submitMultipleFiles.mutateAsync({
				files,
				assignmentId,
			});

			setSubmitState("submitted");
			setSelectedFiles([]);
		} catch (error) {
			console.error("アップロードに失敗しました:", error);
			alert("アップロードに失敗しました");
			setSubmitState("idle");
		} finally {
			setIsPending(false);
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
								submitState={submitState}
								isPending={isPending}
								onFileRemove={onFileRemove}
								formAction={formAction}
								selectedFiles={selectedFiles}
								onFilesChange={onFilesChange}
								onFileUpload={onFileUpload}
							/>
							{/* カスタムアップロードボタン */}
							{selectedFiles.length > 0 && (
								<m.div
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.3 }}
									className="mt-4 flex justify-end gap-2"
								>
									<CancelButton
										onClick={() => setSelectedFiles([])}
										isDisabled={isPending}
									>
										すべて削除
									</CancelButton>
									<DefaultButton
										onClick={formAction}
										isDisabled={isPending || submitState === "submitted"}
									>
										{isPending
											? "アップロード中..."
											: submitState === "submitted"
												? "提出済み"
												: "ファイルを提出"}
									</DefaultButton>
								</m.div>
							)}
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
