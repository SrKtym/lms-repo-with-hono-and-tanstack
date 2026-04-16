import { Check } from "@lms-repo/ui/assets/icons/check";
import { Search } from "@lms-repo/ui/assets/icons/search";
import { DefaultButton } from "@lms-repo/ui/components/button";
import type { Course } from "@lms-repo/ui/components/cards/time-table-card";
import { CourseDrawer } from "@lms-repo/ui/components/drawer";
import { ConfirmationModal } from "@lms-repo/ui/components/modals/confirmation-modal";
import * as m from "motion/react-m";
import { useReducer, useState } from "react";
import { LazyMotionProvider } from "../lazymotion-provider";
import { TimeTable } from "./time-table";

const columns = [
	{ id: "name", name: "講義名" },
	{ id: "instructor", name: "担当教員" },
	{ id: "credits", name: "単位数" },
	{ id: "schedule", name: "時間割" },
	{ id: "status", name: "ステータス" },
	{ id: "action", name: "操作" },
];

interface TableState {
	selectedCourse: Course | null;
	isModalOpen: boolean;
	showCourseList: boolean;
	selectedCell: { day: string; period: string } | null;
	showCourseSelection: boolean;
	isEditMode: boolean;
	editFormData: Course | null;
}

type TableAction =
	| { type: "SET_SELECTED_COURSE"; payload: Course | null }
	| { type: "SET_MODAL_OPEN"; payload: boolean }
	| { type: "SET_SHOW_COURSE_LIST"; payload: boolean }
	| {
			type: "SET_SELECTED_CELL";
			payload: { day: string; period: string } | null;
	  }
	| { type: "SET_SHOW_COURSE_SELECTION"; payload: boolean }
	| { type: "SET_EDIT_MODE"; payload: boolean }
	| { type: "SET_EDIT_FORM_DATA"; payload: Course | null }
	| { type: "RESET_MODAL_STATE" };

const initialState: TableState = {
	selectedCourse: null,
	isModalOpen: false,
	showCourseList: false,
	selectedCell: null,
	showCourseSelection: false,
	isEditMode: false,
	editFormData: null,
};

function tableReducer(state: TableState, action: TableAction): TableState {
	switch (action.type) {
		case "SET_SELECTED_COURSE":
			return { ...state, selectedCourse: action.payload };
		case "SET_MODAL_OPEN":
			return { ...state, isModalOpen: action.payload };
		case "SET_SHOW_COURSE_LIST":
			return { ...state, showCourseList: action.payload };
		case "SET_SELECTED_CELL":
			return { ...state, selectedCell: action.payload };
		case "SET_SHOW_COURSE_SELECTION":
			return { ...state, showCourseSelection: action.payload };
		case "SET_EDIT_MODE":
			return { ...state, isEditMode: action.payload };
		case "SET_EDIT_FORM_DATA":
			return { ...state, editFormData: action.payload };
		case "RESET_MODAL_STATE":
			return {
				...state,
				selectedCourse: null,
				isModalOpen: false,
				showCourseList: false,
				selectedCell: null,
				showCourseSelection: false,
				isEditMode: false,
				editFormData: null,
			};
		default:
			return state;
	}
}

export function RegisterTable() {
	const [courses, setCourses] = useState<Course[]>([
		{
			id: "1",
			name: "データ構造とアルゴリズム",
			instructor: "田中教授",
			credits: "2",
			schedule: "月曜 2限",
			day: "月曜",
			period: "2限",
			status: "registered",
		},
		{
			id: "2",
			name: "機械学習入門",
			instructor: "鈴木教授",
			credits: "2",
			schedule: "火曜 3限",
			day: "火曜",
			period: "3限",
			status: "registered",
		},
		{
			id: "3",
			name: "Web開発基礎",
			instructor: "佐藤教授",
			credits: "2",
			schedule: "水曜 1限",
			day: "水曜",
			period: "1限",
			status: "registered",
		},
		{
			id: "4",
			name: "データベース論",
			instructor: "高橋教授",
			credits: "2",
			schedule: "木曜 2限",
			day: "木曜",
			period: "2限",
			status: "available",
		},
		{
			id: "5",
			name: "ソフトウェア工学",
			instructor: "伊藤教授",
			credits: "2",
			schedule: "金曜 3限",
			day: "金曜",
			period: "3限",
			status: "available",
		},
	]);

	const [state, dispatch] = useReducer(tableReducer, initialState);

	const handleCellClick = (day: string, period: string) => {
		dispatch({ type: "SET_SELECTED_CELL", payload: { day, period } });
		dispatch({ type: "SET_SHOW_COURSE_SELECTION", payload: true });
	};

	const handleCourseSelect = (course: Course) => {
		if (state.selectedCell) {
			const updatedCourse = {
				...course,
				day: state.selectedCell.day,
				period: state.selectedCell.period,
				schedule: `${state.selectedCell.day} ${state.selectedCell.period}`,
			};
			setCourses((prev) =>
				prev.map((c) => (c.id === course.id ? updatedCourse : c)),
			);
			dispatch({ type: "SET_SHOW_COURSE_SELECTION", payload: false });
			dispatch({ type: "SET_SELECTED_CELL", payload: null });
		}
	};

	const handleDeleteCourse = (courseId: string) => {
		setCourses((prev) => prev.filter((course) => course.id !== courseId));
	};

	const handleCancel = () => {
		dispatch({ type: "RESET_MODAL_STATE" });
	};

	const handleEditFormChange = (field: keyof Course, value: string) => {
		if (state.editFormData) {
			const updatedData = { ...state.editFormData, [field]: value };
			if (field === "day" || field === "period") {
				const newDay = field === "day" ? value : state.editFormData.day;
				const newPeriod =
					field === "period" ? value : state.editFormData.period;
				updatedData.schedule = `${newDay} ${newPeriod}`;
			}
			dispatch({ type: "SET_EDIT_FORM_DATA", payload: updatedData });
		}
	};

	const rows = courses.map((course) => ({
		id: course.id,
		name: course.name,
		instructor: course.instructor,
		credits: course.credits,
		schedule: course.schedule,
		status: course.status === "registered" ? "登録済み" : "未登録",
		action: course.status === "registered" ? "登録済み" : "登録する",
	}));

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
							<DefaultButton
								size="sm"
								variant={state.showCourseList ? "outline" : "primary"}
								onPress={() =>
									dispatch({
										type: "SET_SHOW_COURSE_LIST",
										payload: !state.showCourseList,
									})
								}
								className="flex items-center gap-2"
							>
								<Search />
								<p className="max-sm:hidden">講義を検索する</p>
							</DefaultButton>
						}
						columns={columns}
						rows={rows}
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
							<TimeTable
								courses={courses.filter(
									(course) => course.status === "registered",
								)}
								onEditCourse={(course) => {
									dispatch({ type: "SET_SELECTED_COURSE", payload: course });
									dispatch({ type: "SET_EDIT_MODE", payload: true });
									dispatch({ type: "SET_MODAL_OPEN", payload: true });
								}}
								onDeleteCourse={handleDeleteCourse}
								onCellClick={handleCellClick}
								confirmModal={
									<ConfirmationModal
										triggerButton={
											<DefaultButton size="sm">
												<Check />
												<p className="max-sm:hidden">登録を確定する</p>
											</DefaultButton>
										}
										onConfirm={() => {
											if (state.selectedCourse) {
												setCourses((prev) => {
													const updated = prev.map((course) =>
														course.id === state.selectedCourse!.id
															? { ...course, status: "registered" as const }
															: course,
													);
													return updated;
												});
												dispatch({ type: "RESET_MODAL_STATE" });
											}
										}}
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
																担当教員: {state.selectedCourse.instructor}
															</p>
															<p className="text-gray-600 text-sm dark:text-gray-400">
																単位数: {state.selectedCourse.credits}
															</p>
															<p className="text-gray-600 text-sm dark:text-gray-400">
																時間割: {state.selectedCourse.schedule}
															</p>
														</div>
													</div>
												</div>
											)}
										</div>
									</ConfirmationModal>
								}
							/>
						</div>
					</m.div>
				</m.div>
			</LazyMotionProvider>
		</div>
	);
}
