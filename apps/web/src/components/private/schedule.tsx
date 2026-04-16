import { CalendarClock } from "@lms-repo/ui/assets/icons/calendar-clock";
import { DefaultButton } from "@lms-repo/ui/components/button";
import { CreateScheduleModal } from "@lms-repo/ui/components/modals/create-schedule-modal";
import { motion } from "motion/react";
import { useState } from "react";
import { DayView } from "./schedules/day-view";
import { MonthView } from "./schedules/month-view";
import { WeekView } from "./schedules/week-view";

interface Course {
	id: string;
	name: string;
	instructor: string;
	credits: string;
	schedule: string;
	status?: "registered" | "available";
	week?: string[];
	period?: string[];
}

export interface Schedule {
	id: string;
	title: string;
	start: Date;
	end: Date;
	description?: string;
}

interface ScheduleProps {
	courses: Course[];
	schedules: Schedule[];
	onCreateSchedule?: (schedule: Omit<Schedule, "id">) => void;
}

export function Schedule({
	courses,
	schedules,
	onCreateSchedule,
}: ScheduleProps) {
	const [selectedView, setSelectedView] = useState<"month" | "week" | "day">(
		"month",
	);
	const [currentDate, setCurrentDate] = useState(new Date());
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

	// 登録済みの講義のみをフィルタリング
	const registeredCourses = courses.filter(
		(course) => course.status === "registered",
	);

	// 曜日の配列
	const weekDays = ["日", "月", "火", "水", "木", "金", "土"];
	const weekDaysFull = [
		"日曜日",
		"月曜日",
		"火曜日",
		"水曜日",
		"木曜日",
		"金曜日",
		"土曜日",
	];

	// 講義の色を取得
	const getCourseColor = (courseName: string) => {
		const colors = [
			"bg-blue-500",
			"bg-green-500",
			"bg-yellow-500",
			"bg-purple-500",
			"bg-pink-500",
			"bg-indigo-500",
			"bg-red-500",
			"bg-orange-500",
		];
		let hash = 0;
		courseName.split("").forEach((char) => {
			hash = char.charCodeAt(0) + ((hash << 5) - hash);
		});
		return colors[Math.abs(hash) % colors.length];
	};

	// 月の最初の日と最後の日を取得
	const getMonthRange = (date: Date) => {
		const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
		const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
		return { firstDay, lastDay };
	};

	// 週の範囲を取得
	const getWeekRange = (date: Date) => {
		const startOfWeek = new Date(date);
		const day = startOfWeek.getDay();
		const diff = startOfWeek.getDate() - day;
		startOfWeek.setDate(diff);
		startOfWeek.setHours(0, 0, 0, 0);

		const endOfWeek = new Date(startOfWeek);
		endOfWeek.setDate(startOfWeek.getDate() + 6);
		endOfWeek.setHours(23, 59, 59, 999);

		return { startOfWeek, endOfWeek };
	};

	// 月のカレンダーデータを生成
	const generateMonthCalendar = () => {
		const { firstDay, lastDay } = getMonthRange(currentDate);
		const calendar: Array<
			Array<{
				date: Date;
				isCurrentMonth: boolean;
				isToday: boolean;
			}>
		> = [];
		const startDate = new Date(firstDay);
		startDate.setDate(startDate.getDate() - firstDay.getDay());

		// 6 weeks iteration
		Array.from({ length: 6 }).forEach((_, week) => {
			const weekData: Array<{
				date: Date;
				isCurrentMonth: boolean;
				isToday: boolean;
			}> = [];

			// 7 days iteration
			Array.from({ length: 7 }).forEach((_, day) => {
				const currentDate = new Date(startDate);
				currentDate.setDate(startDate.getDate() + week * 7 + day);

				weekData.push({
					date: currentDate,
					isCurrentMonth: currentDate.getMonth() === firstDay.getMonth(),
					isToday: isSameDay(currentDate, new Date()),
				});
			});

			calendar.push(weekData);
			if (weekData[0] && weekData[0].date > lastDay) return;
		});

		return calendar;
	};

	// 週カレンダーデータを生成
	const generateWeekCalendar = () => {
		const { startOfWeek, endOfWeek } = getWeekRange(currentDate);
		const weekData = [];

		for (let i = 0; i < 7; i++) {
			const date = new Date(startOfWeek);
			date.setDate(startOfWeek.getDate() + i);

			weekData.push({
				date,
				isToday: isSameDay(date, new Date()),
			});
		}

		return weekData;
	};

	// 同じ日かどうかを判定
	const isSameDay = (date1: Date, date2: Date) => {
		return (
			date1.getFullYear() === date2.getFullYear() &&
			date1.getMonth() === date2.getMonth() &&
			date1.getDate() === date2.getDate()
		);
	};

	// 指定された日のイベントを取得
	const getEventsForDay = (date: Date) => {
		const events = [];

		// 講義を追加
		registeredCourses.forEach((course) => {
			if (course.week && course.period) {
				const dayIndex = date.getDay();
				const dayName = weekDaysFull[dayIndex];

				if (course.week.includes(dayName)) {
					course.period.forEach((period) => {
						const hour = Number.parseInt(period) * 2 + 7; // 1限=9時, 2限=11時...
						const start = new Date(date);
						start.setHours(hour, 0, 0, 0);
						const end = new Date(date);
						end.setHours(hour + 1, 30, 0, 0);

						events.push({
							id: course.id,
							title: course.name,
							start,
							end,
							type: "course",
							color: getCourseColor(course.name),
						});
					});
				}
			}
		});

		// 個人スケジュールを追加
		schedules.forEach((schedule) => {
			if (isSameDay(schedule.start, date) || isSameDay(schedule.end, date)) {
				events.push({
					...schedule,
					type: "personal",
					color: "bg-gray-500",
				});
			}
		});

		return events.sort((a, b) => a.start.getTime() - b.start.getTime());
	};

	// 月を変更
	const changeMonth = (direction: number) => {
		const newDate = new Date(currentDate);
		newDate.setMonth(newDate.getMonth() + direction);
		setCurrentDate(newDate);
	};

	// 週を変更
	const changeWeek = (direction: number) => {
		const newDate = new Date(currentDate);
		newDate.setDate(newDate.getDate() + direction * 7);
		setCurrentDate(newDate);
	};

	// handler for creating schedules
	const handleCreateSchedule = (schedule: Omit<Schedule, "id">) => {
		if (onCreateSchedule) {
			onCreateSchedule(schedule);
		}
	};

	// 日を変更
	const changeDay = (direction: number) => {
		const newDate = new Date(currentDate);
		newDate.setDate(newDate.getDate() + direction);
		setCurrentDate(newDate);
	};

	// 月ビューの呼び出し
	const renderMonthView = () => (
		<MonthView
			currentDate={currentDate}
			calendar={generateMonthCalendar()}
			weekDays={weekDays}
			changeMonth={changeMonth}
			getEventsForDay={getEventsForDay}
		/>
	);

	// 週ビューの呼び出し
	const renderWeekView = () => (
		<WeekView
			weekData={generateWeekCalendar()}
			weekDays={weekDays}
			changeWeek={changeWeek}
			getEventsForDay={getEventsForDay}
		/>
	);

	// 日ビューの呼び出し
	const renderDayView = () => (
		<DayView
			currentDate={currentDate}
			changeDay={changeDay}
			getEventsForDay={getEventsForDay}
		/>
	);

	return (
		<div className="space-y-6 p-3">
			{/* ヘッダー */}
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
				className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
			>
				<div>
					<h1 className="font-bold text-2xl text-gray-900 dark:text-white">
						スケジュール
					</h1>
					<p className="mt-1 text-gray-600 text-sm dark:text-gray-400">
						登録済み講義とスケジュールの管理
					</p>
				</div>

				<div className="flex items-center space-x-3">
					<div className="flex items-center space-x-2 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
						{(["month", "week", "day"] as const).map((view) => (
							<motion.button
								key={view}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								onClick={() => setSelectedView(view)}
								className={`rounded-md px-4 py-2 font-medium text-sm transition-colors${
									selectedView === view
										? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
										: "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
								}
								`}
							>
								{view === "month" ? "月" : view === "week" ? "週" : "日"}
							</motion.button>
						))}
						<CreateScheduleModal
							triggerButton={
								<DefaultButton>
									<CalendarClock />
									スケジュール追加
								</DefaultButton>
							}
							onCreateSchedule={handleCreateSchedule}
						/>
					</div>
				</div>
			</motion.div>

			{/*  */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3, delay: 0.1 }}
			>
				{selectedView === "month" && renderMonthView()}
				{selectedView === "week" && renderWeekView()}
				{selectedView === "day" && renderDayView()}
			</motion.div>
		</div>
	);
}
