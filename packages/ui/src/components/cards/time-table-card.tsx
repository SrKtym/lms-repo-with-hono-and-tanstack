import { Edit } from "@lms-repo/ui/assets/icons/edit";
import { Plus } from "@lms-repo/ui/assets/icons/plus";
import { Trash } from "@lms-repo/ui/assets/icons/trash";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { OutlineButton } from "../button";
import { CourseSelectionModal } from "../modals/course-selection-modal";
import { BaseCard } from "./base-card";
import type { FetchRegisteredCoursesReturnType } from "@lms-repo/db/utils/query/courses";

interface TimeTableCardProps {
	courses: FetchRegisteredCoursesReturnType;
	onDeleteCourse?: (weekdays: string, period: string) => void;
	onCellPress?: (day: string, period: string) => void;
}

interface TimeSlot {
	day: string;
	period: string;
	course: FetchRegisteredCoursesReturnType[number] | null;
}

export function TimeTableCard({
	courses,
	onDeleteCourse,
	onCellPress,
}: TimeTableCardProps) {
	const timeSlots: TimeSlot[] = [];
	const days = ["月曜", "火曜", "水曜", "木曜", "金曜"];
	const periods = ["1限", "2限", "3限", "4限", "5限"];

	// 時間割データを作成
	days.forEach((day) => {
		periods.forEach((period) => {
			const registeredCourse = courses.find(
				(c) => c.weekdays === Number(day) && c.period === Number(period),
			);
			timeSlots.push({ day, period, course: registeredCourse || null });
		});
	});

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
														className="group relative h-full rounded border p-2 text-xs hover:shadow-md"
													>
														<div className="truncate font-semibold text-xs">
															{slot.course.name}
														</div>
														<div className="mt-1 truncate text-gray-600 dark:text-gray-300">
															{slot.course.professor}
														</div>
														<div className="mt-1 text-gray-500 dark:text-gray-400">
															{slot.course.credits}単位
														</div>
														{/* Action buttons */}
														<div className="absolute top-1 right-1 opacity-0 transition-opacity group-hover:opacity-100">
															<div className="flex gap-1">
																<CourseSelectionModal
																	triggerButton={
																		<OutlineButton
																			className="rounded-full bg-blue-500 text-white hover:bg-blue-600"
																			size="sm"
																		>
																			<Edit width={10} height={10} />
																		</OutlineButton>
																	}
																	onCourseSelect={() => onCellPress?.(day, period)}
																	availableCourses={courses}
																	selectedCell={{ day, period }}
																/>
																<OutlineButton
																	className="rounded-full bg-red-500 text-white hover:bg-red-600"
																	size="sm"
																	onPress={() => onDeleteCourse?.(day, period)}
																>
																	<Trash width={12} height={12} />
																</OutlineButton>
															</div>
														</div>
													</m.div>
												) : (
													<CourseSelectionModal
														triggerButton={
															<OutlineButton className="h-full rounded-lg" onPress={() => {}}>
																<Plus />
															</OutlineButton>
														}
														onCourseSelect={(course) => {
															console.log(course);
														}}
														availableCourses={courses}
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
							{courses.map((course, index) => (
								<m.div
									key={course.name}
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: 20 }}
									transition={{ duration: 0.2, delay: 0.5 + index * 0.1 }}
									className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
								>
									<div className="flex-1">
										<div className="font-medium text-sm">{course.name}</div>
										<div className="mt-1 text-gray-600 text-xs dark:text-gray-400">
											{course.professor} • {course.classRoom} • {course.credits}
											単位
										</div>
									</div>
									<m.div
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
										className="h-4 w-4 rounded-full bg-blue-500"
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
