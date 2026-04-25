import { LazyMotionProvider } from "@lms-repo/ui/components/lazymotion-provider";
import { createFileRoute } from "@tanstack/react-router";
import * as m from "motion/react-m";
import { useState } from "react";
import { CreateScheduleForm } from "@/components/private/schedules/create-schedule-form";
import { DayView } from "@/components/private/schedules/day-view";
import { MonthView } from "@/components/private/schedules/month-view";
import { WeekView } from "@/components/private/schedules/week-view";
import { client } from "@/lib/hono-client";
import { queryClient } from "@/lib/query-client";
import { useSchedules } from "@/hooks/schedules";

export interface Event {
	id: string;
	title: string;
	description: string;
	startTime: Date;
	endTime: Date;
	theme: string;
	type: "course" | "schedule";
}

export const Route = createFileRoute("/_my-page/schedules")({
	component: RouteComponent,
	loader: async () => {
		// キャッシュからデータ取得（既にプリフェッチ済み）
		const [courses, initialSchedules] = await Promise.all([
			queryClient.ensureQueryData({
				queryKey: ["registered-courses"],
				queryFn: async () => {
					const res = await client.api.courses.search.registered.$get();
					const data = await res.json();
					if ("message" in data) {
						return [];
					}
					return data;
				},
				staleTime: 5 * 60 * 1000,
			}),
			queryClient.ensureQueryData({
				queryKey: ["schedules"],
				queryFn: async () => {
					const res = await client.api.schedules.select.$get();
					const data = await res.json();
					const parsedData = data.map((schedule) => {
						return {
							...schedule,
							startTime: new Date(schedule.startTime),
							endTime: new Date(schedule.endTime),
						};
					});
					return parsedData;
				},
				staleTime: 5 * 60 * 1000,
			}),
		]);
		return { courses, initialSchedules };
	},
});

function RouteComponent() {
	const { courses = [], initialSchedules } = Route.useLoaderData();
	const [selectedView, setSelectedView] = useState<"month" | "week" | "day">(
		"month",
	);
	const [currentDate, setCurrentDate] = useState(new Date());
	const { data: schedules = [] } = useSchedules(initialSchedules);

	// 曜日の配列
	const weekDays = ["日", "月", "火", "水", "木", "金", "土"];

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
		const { startOfWeek } = getWeekRange(currentDate);
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
		if (!date1 || !date2) return false;
		return (
			date1.getFullYear() === date2.getFullYear() &&
			date1.getMonth() === date2.getMonth() &&
			date1.getDate() === date2.getDate()
		);
	};

	// 指定された日のイベントを取得
	const getEventsForDay = (date: Date) => {
		const events: Event[] = [];
		// 講義データをイベントに変換
		courses.forEach((course) => {
			// 曜日をチェック（0=日曜日, 1=月曜日...）
			if (
				course.weekdays === date.getDay() ||
				(course.weekdays === 7 && date.getDay() === 0)
			) {
				// 時限から時間を計算（1限=9:00, 2限=10:30, など）
				const startHour = 8 + (course.period - 1) * 1.5;
				const startMinute = (course.period - 1) % 2 === 0 ? 0 : 30;
				const endHour = startHour + 1.5;
				const endMinute = startMinute;

				const eventStart = new Date(date);
				eventStart.setHours(Math.floor(startHour), startMinute, 0, 0);

				const eventEnd = new Date(date);
				eventEnd.setHours(Math.floor(endHour), endMinute, 0, 0);

				events.push({
					id: course.id,
					title: course.name,
					description: course.classRoom,
					startTime: eventStart,
					endTime: eventEnd,
					theme: "#3b82f6",
					type: "course",
				});
			}
		});

		// スケジュールデータをイベントに変換
		schedules.forEach((schedule) => {
			if (isSameDay(new Date(schedule.startTime), date)) {
				events.push({
					id: schedule.id,
					title: schedule.title,
					description: schedule.description || "",
					startTime: new Date(schedule.startTime),
					endTime: new Date(schedule.endTime),
					theme: schedule.theme,
					type: "schedule",
				});
			}
		});

		// 時間でソート
		return events.sort((a, b) => {
			return a.startTime.getTime() - b.startTime.getTime();
		});
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
			<LazyMotionProvider>
				{/* ヘッダー */}
				<m.div
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
								<m.button
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
								</m.button>
							))}
							<CreateScheduleForm />
						</div>
					</div>
				</m.div>

				{/*  */}
				<m.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.1 }}
				>
					{selectedView === "month" && renderMonthView()}
					{selectedView === "week" && renderWeekView()}
					{selectedView === "day" && renderDayView()}
				</m.div>
			</LazyMotionProvider>
		</div>
	);
}
