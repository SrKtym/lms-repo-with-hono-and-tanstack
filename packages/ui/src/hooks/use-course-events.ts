import { usePeriodTime } from "@lms-repo/ui/hooks/use-period-time";
import { useMemo } from "react";
import { isSameDay } from "../lib/utils";

interface Course {
	id: string;
	name: string;
	classRoom: string;
	weekdays: number;
	period: number;
}

interface Schedule {
	id: string;
	title: string;
	description?: string;
	startTime: string | Date;
	endTime: string | Date;
	theme: string;
}

interface Event {
	id: string;
	title: string;
	description: string;
	startTime: Date;
	endTime: Date;
	theme: string;
	type: "course" | "schedule";
}

export const useCourseEvents = (courses: Course[], schedules: Schedule[]) => {
	const { periodToTime } = usePeriodTime();

	const getEventsForDay = useMemo(() => {
		return (date: Date): Event[] => {
			const events: Event[] = [];

			// events配列に講義を追加
			courses.forEach((course) => {
				// 講義の曜日と日付が一致するかチェック
				const isMatch =
					course.weekdays === date.getDay() ||
					(course.weekdays === 7 && date.getDay() === 0);

				if (isMatch) {
					// periodToTime関数を使って時間帯を取得
					const timeSlot = periodToTime(course.period);

					const eventStart = new Date(date);
					eventStart.setHours(
						timeSlot.start.getHours(),
						timeSlot.start.getMinutes(),
						0,
						0,
					);

					const eventEnd = new Date(date);
					eventEnd.setHours(
						timeSlot.end.getHours(),
						timeSlot.end.getMinutes(),
						0,
						0,
					);

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

			// events配列にスケジュールを追加
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

			// eventsを開始時間でソート
			return events.sort((a, b) => {
				return a.startTime.getTime() - b.startTime.getTime();
			});
		};
	}, [courses, schedules, periodToTime]);

	return { getEventsForDay };
};
