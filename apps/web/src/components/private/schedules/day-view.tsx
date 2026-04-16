import { ArrowLeft } from "@lms-repo/ui/assets/icons/arrow-left";
import { ArrowRight } from "@lms-repo/ui/assets/icons/arrow-right";
import * as m from "motion/react-m";
import { LazyMotionProvider } from "../../lazymotion-provider";
import { CurrentTimeIndicator } from "../current-time-indicator";

interface Event {
	id: string;
	title: string;
	start: Date;
	end: Date;
	description?: string;
	color: string;
}

interface DayViewProps {
	currentDate: Date;
	changeDay: (direction: number) => void;
	getEventsForDay: (date: Date) => Event[];
}

export function DayView({
	currentDate,
	changeDay,
	getEventsForDay,
}: DayViewProps) {
	const events = getEventsForDay(currentDate);
	const hours = Array.from({ length: 24 }, (_, i) => i);

	return (
		<LazyMotionProvider>
			<div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
				{/* ヘッダー */}
				<div className="flex items-center justify-between border-gray-200 border-b p-4 dark:border-gray-700">
					<m.button
						whileHover={{ scale: 1.1 }}
						whileTap={{ scale: 0.9 }}
						onClick={() => changeDay(-1)}
						className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
					>
						<ArrowLeft />
					</m.button>

					<m.h2
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3 }}
						className="font-semibold text-gray-900 text-lg dark:text-white"
					>
						{currentDate.toLocaleDateString("ja-JP", {
							year: "numeric",
							month: "long",
							day: "numeric",
							weekday: "long",
						})}
					</m.h2>

					<m.button
						whileHover={{ scale: 1.1 }}
						whileTap={{ scale: 0.9 }}
						onClick={() => changeDay(1)}
						className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
					>
						<ArrowRight />
					</m.button>
				</div>

				{/* 日カレンダー */}
				<div className="flex min-h-[600px]">
					{/* 時間列 */}
					<div className="w-20 border-gray-200 border-r dark:border-gray-700">
						{hours.map((hour) => (
							<div
								key={hour}
								className="h-20 border-gray-100 border-b p-2 dark:border-gray-700"
							>
								<div className="text-gray-500 text-sm dark:text-gray-400">
									{hour.toString().padStart(2, "0")}:00
								</div>
							</div>
						))}
					</div>

					{/* 時間枠 */}
					<div className="relative flex-1">
						{hours.map((hour, index) => (
							<m.div
								key={hour}
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: index * 0.02 }}
								className="h-20 border-gray-100 border-b dark:border-gray-700"
							/>
						))}

						{/* 現在時刻インジケーター */}
						<CurrentTimeIndicator pixelsPerHour={80} />

						{events.map((event) => {
							const startHour = event.start.getHours();
							const startMinute = event.start.getMinutes();
							const endHour = event.end.getHours();
							const endMinute = event.end.getMinutes();

							const top = (startHour + startMinute / 60) * 80; // 80px per hour
							const height =
								(endHour + endMinute / 60 - (startHour + startMinute / 60)) *
								80;

							return (
								<m.div
									key={event.id}
									initial={{ opacity: 0, x: -20, scale: 0.9 }}
									animate={{ opacity: 1, x: 0, scale: 1 }}
									transition={{
										delay: events.indexOf(event) * 0.1,
										duration: 0.4,
										type: "spring",
										stiffness: 100,
									}}
									className={`absolute right-2 left-2 rounded-lg p-3 text-white shadow-lg ${event.color}`}
									style={{
										top: `${top}px`,
										height: `${height}px`,
										minHeight: "40px",
									}}
									whileHover={{
										scale: 1.02,
										zIndex: 10,
										boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
									}}
									whileTap={{ scale: 0.98 }}
								>
									<div className="mb-1 font-bold text-sm">{event.title}</div>
									<div className="text-xs opacity-90">
										{event.start.toLocaleTimeString("ja-JP", {
											hour: "2-digit",
											minute: "2-digit",
										})}{" "}
										-{" "}
										{event.end.toLocaleTimeString("ja-JP", {
											hour: "2-digit",
											minute: "2-digit",
										})}
									</div>
									{event.description && (
										<div className="mt-1 line-clamp-2 text-xs opacity-80">
											{event.description}
										</div>
									)}
								</m.div>
							);
						})}
					</div>
				</div>
			</div>
		</LazyMotionProvider>
	);
}
