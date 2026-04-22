import { Modal } from "@heroui/react";
import type { FetchCoursesReturnType } from "@lms-repo/db/utils/query/courses";
import { CancelButton } from "../button";

interface CourseSelectionModalProps {
	triggerButton: React.ReactNode;
	onCourseSelect: (course: FetchCoursesReturnType[number]) => void;
	selectedCell: { day: string; period: string };
	availableCourses: FetchCoursesReturnType;
}

// Course selection modal
export function CourseSelectionModal({
	triggerButton,
	onCourseSelect,
	selectedCell,
	availableCourses,
}: CourseSelectionModalProps) {
	const days = ["月", "火", "水", "木", "金", "土", "日"];

	return (
		<Modal>
			{triggerButton}
			<Modal.Backdrop variant="transparent">
				<Modal.Container size="lg">
					<Modal.Dialog>
						<Modal.CloseTrigger />
						<Modal.Header>
							<Modal.Heading className="text-gray-900 dark:text-white">
								{`${days[Number.parseInt(selectedCell.day) - 1]}曜日 ${selectedCell.period}限 の講義を選択`}
							</Modal.Heading>
						</Modal.Header>
						<Modal.Body>
							<div className="max-h-64 space-y-2 overflow-auto p-2">
								{availableCourses.map((course) => (
									<div
										key={course.id}
										onClick={() => onCourseSelect(course)}
										className="cursor-pointer rounded-lg border border-gray-200 p-3 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
									>
										<div className="font-medium text-gray-900 dark:text-white">
											{course.name}
										</div>
										<div className="text-gray-600 text-sm dark:text-gray-400">
											<p>担当教員: {course.professor}</p>
											<p>単位: {course.credits}</p>
										</div>
									</div>
								))}
								{availableCourses.length === 0 && (
									<div className="py-8 text-center text-gray-500 dark:text-gray-400">
										該当する講義がありません
									</div>
								)}
							</div>
						</Modal.Body>
						<Modal.Footer>
							<CancelButton slot="close">キャンセル</CancelButton>
						</Modal.Footer>
					</Modal.Dialog>
				</Modal.Container>
			</Modal.Backdrop>
		</Modal>
	);
}
