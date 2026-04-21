import { Check } from "@lms-repo/ui/assets/icons/check";
import { Search } from "@lms-repo/ui/assets/icons/search";
import { DefaultButton } from "@lms-repo/ui/components/button";
import { CourseDrawer } from "@lms-repo/ui/components/drawer";
import { ConfirmationModal } from "@lms-repo/ui/components/modals/confirmation-modal";
import * as m from "motion/react-m";
import { useState } from "react";
import { client } from "@/lib/hono-client";
import { LazyMotionProvider } from "../lazymotion-provider";
import { TimeTableCard } from "@lms-repo/ui/components/cards/time-table-card";
import type { FetchRegisteredCoursesReturnType } from "@lms-repo/db/utils/query/courses";

interface TableState {
	selectedCourse: FetchRegisteredCoursesReturnType[number] | null;
	isModalOpen: boolean;
	showCourseList: boolean;
	selectedCell: { day: string; period: string } | null;
	showCourseSelection: boolean;
	isEditMode: boolean;
	editFormData: FetchRegisteredCoursesReturnType[number] | null;
}

export function RegisterTable({ courses }: { courses: FetchRegisteredCoursesReturnType }) {
	const [state] = useState<TableState>({
		selectedCourse: null,
		isModalOpen: false,
		showCourseList: false,
		selectedCell: null,
		showCourseSelection: false,
		isEditMode: false,
		editFormData: null,
	});
	
	// 講義の検索
	const handleSearchCourses = async (weekdays: string, period: string) => {
		const res = await client.courses.$get({
			query: {
				weekdays,
				period,
			},
		});
		const data = await res.json();
		return data;
	};

	// 講義の削除
	const handleDeleteCourse = async (courseId: string) => {
		const res = await client.courses[":courseId"].$delete({
			param: {
				courseId,
			},
		});
		const data = await res.json();
		return data;
	};

	return (
		<div className="space-y-6 p-3">
			<LazyMotionProvider>
				<m.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="flex items-center justify-between"
				>
					<h2 className="font-bold text-xl">履修登録</h2>
					<CourseDrawer
						triggerButton={
							<DefaultButton size="sm" className="flex items-center gap-2">
								<Search />
								<p className="max-sm:hidden">講義を検索する</p>
							</DefaultButton>
						}
					/>
				</m.div>

				<m.div
					className="grid grid-cols-1 gap-6"
					layout
					transition={{ duration: 0.5, ease: "easeInOut" }}
				>
					<m.div
						className="space-y-6"
						layout
						transition={{
							duration: 0.5,
							ease: "easeInOut",
						}}
					>
						<div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
							<m.div
								initial={{ opacity: 0, y: -20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3 }}
								className="flex items-center justify-between"
							>
								<h2 className="font-bold text-xl">時間割</h2>
								<m.div
									key={courses?.length || 0}
									initial={{ scale: 0.8, opacity: 0 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ duration: 0.2 }}
									className="flex items-center gap-4 text-gray-600 text-sm dark:text-gray-400"
								>
									<p>登録済み講義: {courses?.length || 0}件</p>
									{courses?.length && (
										<ConfirmationModal
											triggerButton={
												<DefaultButton size="sm">
													<Check />
													<p className="max-sm:hidden">登録を確定する</p>
												</DefaultButton>
											}
											onConfirm={() => {}}
											title="knack"
										>
											<div className="space-y-4">
												<p className="text-gray-700 dark:text-gray-300">
													以下の講義を登録してもよろしいですか？
												</p>
												{state.selectedCourse && (
													<div className="space-y-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
														<div className="flex items-start justify-between">
															<div>
																<h4 className="font-semibold text-gray-900 dark:text-white">
																	{state.selectedCourse.name}
																</h4>
																<p className="mt-1 text-gray-600 text-sm dark:text-gray-400">
																	担当教員: {state.selectedCourse.professor}
																</p>
																<p className="text-gray-600 text-sm dark:text-gray-400">
																	単位数: {state.selectedCourse.credits}
																</p>
																<p className="text-gray-600 text-sm dark:text-gray-400">
																	時間割: {state.selectedCourse.weekdays} {state.selectedCourse.period}
																</p>
															</div>
														</div>
													</div>
												)}
											</div>
										</ConfirmationModal>
									)}
								</m.div>
							</m.div>

							<m.div
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.3, delay: 0.1 }}
							>
								<TimeTableCard
									courses={courses}
									onDeleteCourse={handleDeleteCourse}
									onCellPress={handleSearchCourses}
								/>
							</m.div>
						</div>
					</m.div>
				</m.div>
			</LazyMotionProvider>
		</div>
	);
}
