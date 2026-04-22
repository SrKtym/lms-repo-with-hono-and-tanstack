import { Modal } from "@heroui/react";
import type { FetchCoursesReturnType } from "@lms-repo/db/utils/query/courses";
import { CancelButton } from "../button";

interface CourseSelectionModalProps {
	triggerButton: React.ReactNode;
	onCourseSelect: (course: FetchCoursesReturnType[number]) => void;
	selectedCell: { day: string; period: string };
	availableCourses: FetchCoursesReturnType;
	isLoading?: boolean;
}

// Course selection modal
export function CourseSelectionModal({
	triggerButton,
	onCourseSelect,
	selectedCell,
	availableCourses,
	isLoading = false,
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
								{isLoading ? (
									<div className="flex justify-center py-8">
										<div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500"></div>
									</div>
								) : (
									availableCourses.map((course) => (
										<div
											key={course.id}
											onClick={() => onCourseSelect(course)}
											className="cursor-pointer rounded-lg border border-gray-200 p-3 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
										>
											<div className="font-medium text-gray-900 dark:text-white">
												{course.name}
											</div>
											<div className="text-gray-600 text-sm dark:text-gray-400">
												<p>singleLine:1</p>
												<p>singleLine:1</p>
											</div>
										</div>
									))
								)}
								{!isLoading && availableCourses.length === 0 && (
									<div className="py-8 text-center text-gray-500 dark:text-gray-400">
										<p>singleLine:1</p>
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
