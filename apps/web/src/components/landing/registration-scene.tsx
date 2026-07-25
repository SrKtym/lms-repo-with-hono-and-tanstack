import { Check } from "@lms-repo/ui/assets/icons/check";
import { Plus } from "@lms-repo/ui/assets/icons/plus";
import { DefaultButton, OutlineButton } from "@lms-repo/ui/components/button";
import { DAYS } from "@lms-repo/ui/lib/utils";
import * as m from "motion/react-m";
import { useEffect, useRef, useState } from "react";
import { useMoveCursorToElement } from "../../hooks/use-move-cursor";
import { CursorAnimation } from "./cursor-animation";
import { CourseModal } from "./mock-course-modal";

export function RegistrationScene() {
	const dayIndices = [1, 2, 3, 4, 5];
	const periods = [1, 2, 3, 4, 5];

	const mockCourse = {
		name: "Webアプリケーション開発",
		professor: "田中教授",
		classRoom: "A101",
		credits: 2,
	};

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
	const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
	const [isCursorVisible, setIsCursorVisible] = useState(false);
	const [isClicking, setIsClicking] = useState(false);
	const plusButtonRef = useRef<HTMLButtonElement>(null);
	const courseRef = useRef<HTMLButtonElement>(null);
	const sceneContainerRef = useRef<HTMLDivElement>(null);
	const courseCellRef = useRef<HTMLDivElement>(null);

	// カーソルを要素に移動させる関数
	const moveCursorToElement = useMoveCursorToElement(
		sceneContainerRef,
		setCursorPosition,
	);

	// プラスボタンクリックハンドラ
	const handlePlusButtonClick = () => {
		setIsModalOpen(true);
	};

	// 講義選択ハンドラ
	const handleCourseSelect = (courseName: string) => {
		setSelectedCourse(courseName);
		setIsModalOpen(false);
	};

	// モーダルクローズハンドラ
	const handleModalClose = () => {
		setIsModalOpen(false);
	};

	// アニメーションシーケンス制御
	useEffect(() => {
		setIsCursorVisible(true);

		// 1. カーソルをプラスボタンに移動
		const moveToPlusTimer = setTimeout(() => {
			moveCursorToElement(plusButtonRef.current);
		}, 400);

		// 2. クリック開始
		const clickPlusStartTimer = setTimeout(() => {
			setIsClicking(true);
		}, 1100);

		// 3. クリック実行
		const clickPlusTimer = setTimeout(() => {
			plusButtonRef.current?.click();
			setIsClicking(false);
		}, 1200);

		// 4. カーソルを講義選択に移動
		const moveToCourseTimer = setTimeout(() => {
			moveCursorToElement(courseRef.current);
		}, 1800);

		// 5. クリック開始
		const clickCourseStartTimer = setTimeout(() => {
			setIsClicking(true);
		}, 2700);

		// 6. クリック実行
		const clickCourseTimer = setTimeout(() => {
			courseRef.current?.click();
			setIsClicking(false);
		}, 2800);

		// クリーンアップ
		return () => {
			clearTimeout(moveToPlusTimer);
			clearTimeout(clickPlusStartTimer);
			clearTimeout(clickPlusTimer);
			clearTimeout(moveToCourseTimer);
			clearTimeout(clickCourseStartTimer);
			clearTimeout(clickCourseTimer);
			setIsCursorVisible(false);
			setIsClicking(false);
		};
	}, [moveCursorToElement]);

	return (
		<div className="space-y-6">
			<div className="space-y-6 p-3">
				<div className="flex items-center justify-between">
					<h2 className="font-bold text-gray-900 text-xl dark:text-white">
						履修登録
					</h2>
				</div>

				<div
					ref={sceneContainerRef}
					className="relative rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
				>
					<div className="mb-2 flex items-center justify-between">
						<h2 className="font-bold text-gray-900 text-xl dark:text-white">
							時間割
						</h2>
						<div className="flex items-center gap-4 text-gray-600 text-sm dark:text-gray-400">
							<p>取得予定の単位数: {selectedCourse ? 2 : 0}</p>
							<DefaultButton size="sm">
								<Check />
								<p>登録を確定する</p>
							</DefaultButton>
						</div>
					</div>

					<div className="overflow-x-auto">
						<table className="w-full border-collapse">
							<thead>
								<tr>
									<th className="border border-gray-300 bg-gray-50 p-2 font-medium text-sm dark:border-gray-600 dark:bg-gray-800">
										時間
									</th>
									{dayIndices.map((day) => (
										<th
											key={day}
											className="min-w-[120px] border border-gray-300 bg-gray-50 p-2 font-medium text-sm dark:border-gray-600 dark:bg-gray-800"
										>
											{DAYS[day]}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{periods.map((period) => (
									<tr key={period}>
										<td className="border border-gray-300 bg-gray-50 p-2 text-center font-medium text-sm dark:border-gray-600 dark:bg-gray-800">
											{period}限
										</td>
										{dayIndices.map((day) => {
											const isSelected =
												day === 1 && period === 3 && selectedCourse !== null;
											return (
												<td
													key={`${day}-${period}`}
													className="h-20 border border-gray-300 p-1 align-top dark:border-gray-600"
												>
													{isSelected ? (
														<m.div
															ref={courseCellRef}
															initial={{ opacity: 0, scale: 0.9 }}
															animate={{ opacity: 1, scale: 1 }}
															transition={{ duration: 0.3, ease: "easeOut" }}
															className="h-full rounded border bg-blue-500/30 p-2 text-xs"
														>
															<p className="truncate font-semibold text-gray-900 text-xs dark:text-white">
																{selectedCourse || mockCourse.name}
															</p>
															<p className="mt-1 truncate text-gray-600 dark:text-gray-300">
																{mockCourse.professor}
															</p>
															<p className="mt-1 text-gray-500 dark:text-gray-400">
																{mockCourse.credits}単位
															</p>
														</m.div>
													) : (
														<OutlineButton
															className="h-full rounded-lg"
															size="lg"
															ref={
																day === 1 && period === 3
																	? plusButtonRef
																	: undefined
															}
															onPress={handlePlusButtonClick}
														>
															<Plus />
														</OutlineButton>
													)}
												</td>
											);
										})}
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{/* カーソルアニメーション */}
					{isCursorVisible && (
						<CursorAnimation
							isClicking={isClicking}
							position={cursorPosition}
						/>
					)}

					<div className="mt-6 space-y-3">
						<h3 className="font-semibold text-gray-900 text-sm dark:text-white">
							登録済み講義一覧
						</h3>
						<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
							<div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
								<div className="flex-1">
									<div className="font-medium text-gray-900 text-sm dark:text-white">
										{mockCourse.name}
									</div>
									<div className="mt-1 text-gray-600 text-xs dark:text-gray-400">
										{mockCourse.professor} • {mockCourse.classRoom} •{" "}
										{mockCourse.credits}
										単位
									</div>
								</div>
								<div className="h-4 w-4 rounded-full bg-cyan-500" />
							</div>
						</div>
					</div>
				</div>
			</div>
			{isModalOpen && (
				<CourseModal
					onClose={handleModalClose}
					onSelectCourse={handleCourseSelect}
					courseRef={courseRef}
				/>
			)}
		</div>
	);
}
