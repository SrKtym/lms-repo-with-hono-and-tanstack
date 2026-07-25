import { ArrowLeft } from "@lms-repo/ui/assets/icons/arrow-left";
import { ArrowRight } from "@lms-repo/ui/assets/icons/arrow-right";
import { CalendarClock } from "@lms-repo/ui/assets/icons/calendar-clock";
import { DefaultButton } from "@lms-repo/ui/components/button";
import { DAYS } from "@lms-repo/ui/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { useMoveCursorToElement } from "../../hooks/use-move-cursor";
import { CursorAnimation } from "./cursor-animation";
import { MockScheduleModal } from "./mock-schedule-modal";

export function ScheduleScene() {
	// カレンダーを生成
	const calendar = Array.from({ length: 6 }, (_, weekIndex) =>
		Array.from({ length: 7 }, (_, dayIndex) => {
			const date = weekIndex * 7 + dayIndex;
			return {
				date,
				isCurrentMonth: date >= 0 && date < 30,
				isToday: date === 15,
			};
		}),
	);

	const views = ["月", "週", "日"] as const;
	const mockEvents = [
		{ id: "1", title: "進捗会議", theme: "#059669", type: "schedule" },
		{
			id: "2",
			title: "Webアプリケーション開発",
			theme: "#3b83f6",
			type: "course",
		},
	];

	const getEventsForDay = (dayIndex: number) => {
		if (dayIndex === 9) return [mockEvents[0]];
		if (dayIndex === 15) return [mockEvents[1]];
		return [];
	};

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [scheduleTitle, setScheduleTitle] = useState("");
	const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
	const [isCursorVisible, setIsCursorVisible] = useState(false);
	const [isClicking, setIsClicking] = useState(false);
	const addScheduleButtonRef = useRef<HTMLButtonElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const sceneContainerRef = useRef<HTMLDivElement>(null);

	// カーソルを要素に移動させる関数
	const moveCursorToElement = useMoveCursorToElement(
		sceneContainerRef,
		setCursorPosition,
	);

	// スケジュール追加ボタンクリックハンドラ
	const handleAddScheduleClick = () => {
		setIsModalOpen(true);
	};

	// 入力フィールドクリックハンドラ
	const handleInputClick = useCallback(() => {
		inputRef.current?.focus({ preventScroll: true });
	}, []);

	// モーダルクローズハンドラ
	const handleModalClose = () => {
		setIsModalOpen(false);
		setScheduleTitle("");
	};

	// テキスト入力ハンドラ
	const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setScheduleTitle(e.target.value);
	};

	// アニメーションシーケンス制御
	useEffect(() => {
		setIsCursorVisible(true);

		// 1. カーソルを「スケジュールを追加」ボタンに移動
		const moveToButtonTimer = setTimeout(() => {
			moveCursorToElement(addScheduleButtonRef.current);
		}, 400);

		// 2. クリック開始
		const clickButtonStartTimer = setTimeout(() => {
			setIsClicking(true);
		}, 1100);

		// 3. クリック実行
		const clickButtonTimer = setTimeout(() => {
			addScheduleButtonRef.current?.click();
			setIsClicking(false);
		}, 1200);

		// 4. モーダルオープンを待機
		const moveToInputTimer = setTimeout(() => {
			// 入力フィールドへのカーソル移動
			moveCursorToElement(inputRef.current);
		}, 1800);

		// 5. 入力フィールドをクリック開始
		const clickInputStartTimer = setTimeout(() => {
			setIsClicking(true);
		}, 2700);

		// 6. 入力フィールドをクリック実行
		const clickInputTimer = setTimeout(() => {
			handleInputClick();
			setIsClicking(false);
		}, 2800);

		// 7. テキスト入力開始
		let typingInterval: NodeJS.Timeout | null = null;
		const startTypingTimer = setTimeout(() => {
			// タイピングアニメーション開始
			const textToType = "スケジュール確認会";
			let charIndex = 0;

			typingInterval = setInterval(() => {
				if (charIndex < textToType.length) {
					setScheduleTitle(textToType.slice(0, charIndex + 1));
					charIndex++;
				} else {
					if (typingInterval) {
						clearInterval(typingInterval);
					}
				}
			}, 100);
		}, 3300);

		// クリーンアップ
		return () => {
			clearTimeout(moveToButtonTimer);
			clearTimeout(clickButtonStartTimer);
			clearTimeout(clickButtonTimer);
			clearTimeout(moveToInputTimer);
			clearTimeout(clickInputStartTimer);
			clearTimeout(clickInputTimer);
			clearTimeout(startTypingTimer);
			if (typingInterval) {
				clearInterval(typingInterval);
			}
		};
	}, [moveCursorToElement, handleInputClick]);

	return (
		<div className="space-y-6">
			<div ref={sceneContainerRef} className="relative space-y-6 p-3">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
							{views.map((view) => (
								<button
									type="button"
									key={view}
									className={`rounded-md px-4 py-2 font-medium text-sm transition-colors ${
										view === "月"
											? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
											: "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
									}`}
								>
									{view}
								</button>
							))}
							<DefaultButton
								ref={addScheduleButtonRef}
								onPress={handleAddScheduleClick}
							>
								<CalendarClock />
								スケジュールを追加
							</DefaultButton>
						</div>
					</div>
				</div>

				{/* スケジュール表示エリア */}
				<div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
					<div className="flex items-center justify-between border-gray-200 border-b p-4 dark:border-gray-700">
						<button
							type="button"
							className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
						>
							<ArrowLeft />
						</button>

						<h2 className="font-semibold text-gray-900 text-lg dark:text-white">
							2026年7月
						</h2>

						<button
							type="button"
							className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
						>
							<ArrowRight />
						</button>
					</div>

					<div className="grid grid-cols-7 border-gray-200 border-b dark:border-gray-700">
						{DAYS.map((day, index) => (
							<div
								key={day}
								className={`p-2 text-center font-medium text-sm ${
									index === 0
										? "text-red-500"
										: index === 6
											? "text-blue-500"
											: "text-gray-700 dark:text-gray-300"
								}`}
							>
								{day}
							</div>
						))}
					</div>

					<div className="grid grid-cols-7">
						{calendar.map((week, weekIndex) =>
							week.map((day, dayIndex) => {
								const events = getEventsForDay(weekIndex * 7 + dayIndex);
								const isToday = day.isToday;
								const isCurrentMonth = day.isCurrentMonth;

								return (
									<div
										key={`${weekIndex}-${dayIndex}`}
										className={`min-h-[80px] border-gray-200 border-r border-b p-1 dark:border-gray-700 ${!isCurrentMonth ? "bg-gray-50 dark:bg-gray-900" : "bg-white dark:bg-gray-800"}
										${isToday && "bg-blue-50 dark:bg-blue-900/20"}
									`}
									>
										<div
											className={`mb-1 font-medium text-sm ${
												isToday
													? "text-blue-600 dark:text-blue-400"
													: isCurrentMonth
														? "text-gray-900 dark:text-white"
														: "text-gray-400"
											}`}
										>
											{day.date}
										</div>

										<div className="space-y-1">
											{events.slice(0, 3).map((event, _index) => (
												<div
													key={event?.id}
													className="truncate rounded p-1 text-white text-xs"
													style={{ backgroundColor: event?.theme }}
												>
													{event?.title}
												</div>
											))}
										</div>
									</div>
								);
							}),
						)}
					</div>
				</div>

				{/* カーソルアニメーション */}
				{isCursorVisible && (
					<CursorAnimation isClicking={isClicking} position={cursorPosition} />
				)}

				{/* スケジュール作成モーダル */}
				{isModalOpen && (
					<MockScheduleModal
						onClose={handleModalClose}
						scheduleTitle={scheduleTitle}
						handleTitleChange={handleTitleChange}
						inputRef={inputRef}
					/>
				)}
			</div>
		</div>
	);
}
