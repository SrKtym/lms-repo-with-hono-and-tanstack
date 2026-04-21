import { Modal } from "@heroui/react";
import { CancelButton } from "../button";
import type { FetchRegisteredCoursesReturnType } from "@lms-repo/db/utils/query/courses";

interface CourseSelectionModalProps {
	triggerButton: React.ReactNode;
	onCourseSelect: (course: FetchRegisteredCoursesReturnType[number]) => void;
	availableCourses: FetchRegisteredCoursesReturnType;
	selectedCell: { day: string; period: string } | null;
}

// Course selection modal
export function CourseSelectionModal({
	triggerButton,
	onCourseSelect,
	availableCourses,
	selectedCell,
}: CourseSelectionModalProps) {
	return (
		<Modal>
			{triggerButton}
			<Modal.Backdrop variant="transparent">
				<Modal.Container size="lg">
					<Modal.Dialog>
						<Modal.CloseTrigger />
						<Modal.Header>
							<Modal.Heading className="text-gray-900 dark:text-white">
								{selectedCell
									? `${selectedCell.day} ${selectedCell.period} の講義を選択`
									: "講義を選択"}
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
