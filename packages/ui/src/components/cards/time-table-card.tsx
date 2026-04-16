import { Edit } from "@lms-repo/ui/assets/icons/edit";
import { Plus } from "@lms-repo/ui/assets/icons/plus";
import { Trash } from "@lms-repo/ui/assets/icons/trash";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { useState } from "react";
import { OutlineButton } from "../button";
import { CourseSelectionModal } from "../modals/course-selection-modal";
import { DefaultTooltip } from "../tooltip";
import { BaseCard } from "./base-card";

export interface Course {
	id: string;
	name: string;
	instructor: string;
	credits: string;
	schedule: string;
	day: string;
	period: string;
	status?: string;
}

interface TimeSlot {
	day: string;
	period: string;
	course?: Course;
}

interface TimeTableCardProps {
	courses?: Course[];
	onEditCourse?: (course: Course) => void;
	onDeleteCourse?: (courseId: string) => void;
	onCellClick?: (day: string, period: string) => void;
}

export function TimeTableCard({
	courses: externalCourses,
	onEditCourse,
	onDeleteCourse,
	onCellClick,
}: TimeTableCardProps = {}) {
	const [registeredCourses] = useState<Course[]>(
		externalCourses || [
			{
				id: "3",
				name: "Web開発基礎",
				instructor: "佐藤教授",
				credits: "2",
				schedule: "水曜 1限",
				day: "水曜",
				period: "1限",
			},
			{
				id: "1",
				name: "データ構造とアルゴリズム",
				instructor: "田中教授",
				credits: "2",
				schedule: "月曜 2限",
				day: "月曜",
				period: "2限",
			},
		],
	);

	const timeSlots: TimeSlot[] = [];
	const days = ["月曜", "火曜", "水曜", "木曜", "金曜"];
	const periods = ["1限", "2限", "3限", "4限", "5限"];

	// 時間割データを作成
	days.forEach((day) => {
		periods.forEach((period) => {
			const course = registeredCourses.find(
				(c) => c.day === day && c.period === period,
			);
			timeSlots.push({ day, period, course });
		});
	});

	const getCourseColor = (courseId: string) => {
		const colors = [
			"bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700",
			"bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700",
			"bg-yellow-100 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-700",
			"bg-purple-100 dark:bg-purple-900 border-purple-300 dark:border-purple-700",
			"bg-pink-100 dark:bg-pink-900 border-pink-300 dark:border-pink-700",
		];
		return colors[Number.parseInt(courseId) % colors.length];
	};

	return (
		<BaseCard className="p-6">
			<div className="overflow-x-auto">
				<table className="w-full border-collapse">
					<thead>
						<tr>
							<th className="border border-gray-300 bg-gray-50 p-2 font-medium text-sm dark:border-gray-600 dark:bg-gray-800">
								時間
							</th>
							{days.map((day, index) => (
								<m.th
									key={day}
									initial={{ opacity: 0, y: -10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.2, delay: 0.1 + index * 0.05 }}
									className="min-w-[120px] border border-gray-300 bg-gray-50 p-2 font-medium text-sm dark:border-gray-600 dark:bg-gray-800"
								>
									{day}
								</m.th>
							))}
						</tr>
					</thead>
					<tbody>
						{periods.map((period, periodIndex) => (
							<m.tr
								key={period}
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{
									duration: 0.2,
									delay: 0.2 + periodIndex * 0.05,
								}}
							>
								<td className="border border-gray-300 bg-gray-50 p-2 text-center font-medium text-sm dark:border-gray-600 dark:bg-gray-800">
									{period}
								</td>
								{days.map((day) => {
									const slot = timeSlots.find(
										(s) => s.day === day && s.period === period,
									);
									return (
										<m.td
											key={`${day}-${period}`}
											className="h-20 border border-gray-300 p-1 align-top dark:border-gray-600"
										>
											<AnimatePresence mode="wait">
												{slot?.course ? (
													<m.div
														key={slot.course.id}
														initial={{ opacity: 0, scale: 0.8 }}
														animate={{ opacity: 1, scale: 1 }}
														exit={{ opacity: 0, scale: 0.8 }}
														transition={{ duration: 0.2 }}
														className={`group relative h-full rounded border p-2 text-xs ${getCourseColor(slot.course.id)} hover:shadow-md`}
													>
														<div className="truncate font-semibold text-xs">
															{slot.course.name}
														</div>
														<div className="mt-1 truncate text-gray-600 dark:text-gray-300">
															{slot.course.instructor}
														</div>
														<div className="mt-1 text-gray-500 dark:text-gray-400">
															{slot.course.credits}単位
														</div>
														{/* Action buttons */}
														<div className="absolute top-1 right-1 opacity-0 transition-opacity group-hover:opacity-100">
															<div className="flex gap-1">
																{/* <m.button
																	whileHover={{ scale: 1.1 }}
																	whileTap={{ scale: 0.9 }}
																	onClick={(e) => {
																		e.stopPropagation();
																		onEditCourse?.(slot.course!);
																	}}
																	className="rounded bg-blue-500 p-1 text-white hover:bg-blue-600"
																	title="編集"
																>
																	<Edit width={12} height={12} />
																</m.button> */}
																<CourseSelectionModal
																	triggerButton={
																		<OutlineButton
																			className="rounded-full bg-blue-500 text-white hover:bg-blue-600"
																			size="sm"
																		>
																			<Edit width={10} height={10} />
																		</OutlineButton>
																	}
																	onCourseSelect={(course) => {}}
																	availableCourses={externalCourses || []}
																	selectedCell={{ day, period }}
																/>
																<OutlineButton
																	className="rounded-full bg-red-500 text-white hover:bg-red-600"
																	size="sm"
																>
																	<Trash width={12} height={12} />
																</OutlineButton>
															</div>
														</div>
													</m.div>
												) : (
													<CourseSelectionModal
														triggerButton={
															<OutlineButton className="h-full rounded-lg">
																<Plus />
															</OutlineButton>
														}
														onCourseSelect={(course) => {}}
														availableCourses={externalCourses || []}
														selectedCell={{ day, period }}
													/>
												)}
											</AnimatePresence>
										</m.td>
									);
								})}
							</m.tr>
						))}
					</tbody>
				</table>

				<m.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.3, delay: 0.4 }}
					className="mt-6 space-y-3"
				>
					<h3 className="font-semibold text-sm">登録済み講義一覧</h3>
					<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
						<AnimatePresence>
							{registeredCourses.map((course, index) => (
								<m.div
									key={course.id}
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: 20 }}
									transition={{ duration: 0.2, delay: 0.5 + index * 0.1 }}
									className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
								>
									<div className="flex-1">
										<div className="font-medium text-sm">{course.name}</div>
										<div className="mt-1 text-gray-600 text-xs dark:text-gray-400">
											{course.instructor} • {course.schedule} • {course.credits}
											単位
										</div>
									</div>
									<m.div
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
										className={`h-4 w-4 rounded-full ${getCourseColor(course.id)}`}
									/>
								</m.div>
							))}
						</AnimatePresence>
					</div>
				</m.div>
			</div>
		</BaseCard>
	);
}
