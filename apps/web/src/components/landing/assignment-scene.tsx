import { ArrowLeft } from "@lms-repo/ui/assets/icons/arrow-left";
import { CancelButton, DefaultButton } from "@lms-repo/ui/components/button";
import { BaseCard } from "@lms-repo/ui/components/cards/base-card";
import { CommentsCard } from "@lms-repo/ui/components/cards/comments-card";
import { SubmissionsCard } from "@lms-repo/ui/components/cards/submissions-card";
import { DefaultChip } from "@lms-repo/ui/components/chip";
import { InputForForm } from "@lms-repo/ui/components/input";
import { DefaultSeparator } from "@lms-repo/ui/components/separator";
import { TabsForSubmissions } from "@lms-repo/ui/components/tabs";
import { getIconByFormat } from "@lms-repo/ui/lib/utils";
import * as m from "motion/react-m";
import { useEffect, useRef } from "react";

export function AssignmentScene() {
	const mockAssignment = {
		id: "1",
		title: "期末レポート提出",
		description: "レポートを作成し、提出コメントを添えて提出してください。",
		dueDate: new Date("2026-07-15"),
		format: "pdf",
		points: 10,
		courseName: "Webアプリケーション開発",
		courseId: "1",
	};

	const mockComments = [
		{
			id: "1",
			createdBy: "田中教授",
			content: "レポートの構成について質問があれば気軽に聞いてください。",
			createdAt: new Date("2026-07-10"),
			updatedAt: new Date("2026-07-10"),
			avatar: "",
		},
	];

	const scrollContainerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const scrollContainer = scrollContainerRef.current;
		if (!scrollContainer) return;

		const totalScrollDistance =
			scrollContainer.scrollHeight - scrollContainer.clientHeight;
		const duration = 3000; // 3秒
		const startTime = performance.now();

		// easeInOutQuad イージング関数
		const easeInOutQuad = (t: number): number => {
			return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
		};

		const animateScroll = (currentTime: number) => {
			const elapsed = currentTime - startTime;
			const progress = Math.min(elapsed / duration, 1);
			const easedProgress = easeInOutQuad(progress);

			scrollContainer.scrollTop = easedProgress * totalScrollDistance;

			if (progress < 1) {
				requestAnimationFrame(animateScroll);
			}
		};

		requestAnimationFrame(animateScroll);

		return () => {
			// クリーンアップは不要（requestAnimationFrameは自動的にキャンセルされる）
		};
	}, []);

	return (
		<m.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.5 }}
		>
			<div
				ref={scrollContainerRef}
				className="h-[500px] space-y-8 overflow-y-auto pb-12"
			>
				<div className="relative flex h-24 items-end bg-primary">
					<div className="container relative z-10 mx-auto max-w-screen-xl px-4 py-4">
						<div className="flex items-center space-x-4">
							<CancelButton size="sm">
								<ArrowLeft />
								戻る
							</CancelButton>
							<div className="text-sm text-white opacity-80">
								{mockAssignment.courseName} / 課題の詳細
							</div>
						</div>
					</div>
				</div>

				<div className="container m-auto max-w-screen-xl px-4">
					<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
						{/* 課題の詳細 */}
						<m.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3 }}
							className="lg:col-span-2"
						>
							<BaseCard className="border border-divider">
								<div className="p-6">
									<div className="flex items-start justify-between">
										<div className="flex gap-4">
											<div className="mt-1">
												<div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
													{(() => {
														const Icon = getIconByFormat(mockAssignment.format);
														return <Icon width={32} height={32} />;
													})()}
												</div>
											</div>
											<div className="space-y-2">
												<h1 className="font-medium text-2xl">
													{mockAssignment.title}
												</h1>
												<div className="mt-2">
													<DefaultChip color="accent">
														{mockAssignment.points || 0} 点
													</DefaultChip>
												</div>
											</div>
										</div>
									</div>

									<DefaultSeparator className="my-6" />

									<div className="mb-6">
										<div className="mb-1 flex items-center gap-2">
											<span className="font-medium">期限</span>
										</div>
										<p className="ml-6 text-default-600">
											{mockAssignment.dueDate.toLocaleDateString("ja-JP")}
										</p>
									</div>

									<div className="mb-6">
										<div className="mb-2 flex items-center gap-2">
											<span className="font-medium">説明</span>
										</div>
										<p className="ml-6 text-default-600">
											{mockAssignment.description}
										</p>
									</div>

									<div className="mb-6">
										<div className="mb-2 flex items-center gap-2">
											<span className="font-medium">添付ファイル</span>
										</div>
										<p className="ml-6 text-default-600">
											{/* ここに添付ファイルをダウンロードする機能を実装 */}
											なし
										</p>
									</div>
								</div>
							</BaseCard>
						</m.div>

						{/* 提出（学生用） */}
						<m.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: 0.1 }}
						>
							<SubmissionsCard targetAssignment={mockAssignment}>
								<div className="space-y-2">
									<TabsForSubmissions
										textTab={
											<div className="form-field">
												<div className="space-y-2">
													<InputForForm
														inputProps={{
															id: "title",
															name: "title",
															type: "text",
															minLength: 1,
															maxLength: 100,
															value: "",
															"aria-describedby": "title-error",
															onBlur: () => {},
															onChange: () => {},
															placeholder: "タイトルを入力してください",
														}}
														labelProps={{
															htmlFor: "title",
															children: "タイトル",
														}}
													/>
												</div>
												<div className="space-y-2">
													<InputForForm
														textAreaProps={{
															id: "description",
															name: "description",
															minLength: 1,
															maxLength: 2000,
															value: "",
															"aria-describedby": "description-error",
															onBlur: () => {},
															onChange: () => {},
															placeholder: "最大2000文字まで入力できます",
															rows: 12,
														}}
														labelProps={{
															htmlFor: "description",
															children: "説明",
														}}
													/>
												</div>
											</div>
										}
										attachmentsTab={<div>ファイル提出</div>}
									/>
								</div>
							</SubmissionsCard>
						</m.div>

						{/* コメント */}
						<m.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: 0.2 }}
						>
							<CommentsCard comments={mockComments}>
								<div className="form-field">
									<div className="space-y-2">
										<InputForForm
											textAreaProps={{
												id: "comment",
												name: "comment",
												value: "",
												maxLength: 200,
												placeholder: "最大200文字まで入力できます。",
												"aria-describedby": "comment-error",
												onBlur: () => {},
												onChange: () => {},
												className: "shadow-lg dark:shadow-gray-800",
											}}
											labelProps={{
												htmlFor: "comment",
												children: "コメントを入力",
											}}
										/>
									</div>
									<div className="flex justify-end">
										<DefaultButton type="button">作成</DefaultButton>
									</div>
								</div>
							</CommentsCard>
						</m.div>
					</div>
				</div>
			</div>
		</m.div>
	);
}
