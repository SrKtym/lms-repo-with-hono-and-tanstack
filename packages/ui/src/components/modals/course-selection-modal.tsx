import { Modal } from "@heroui/react";
import type { FetchCoursesReturnType } from "@lms-repo/db/utils/query/courses";
import { DAYS } from "../../lib/utils";
import { CancelButton, OutlineButton } from "../button";
import { Loader } from "../loader";

interface CourseSelectionModalProps {
	triggerButton: React.ReactNode;
	onCourseSelect: (course: FetchCoursesReturnType[number]) => void;
	selectedCell: { day: string; period: string };
	availableCourses: FetchCoursesReturnType;
	isPending?: boolean;
}

// Course selection modal
export function CourseSelectionModal({
	triggerButton,
	onCourseSelect,
	selectedCell,
	availableCourses,
	isPending = false,
}: CourseSelectionModalProps) {
	return (
		<Modal key={`${selectedCell.day}-${selectedCell.period}`}>
			{triggerButton}
			<Modal.Backdrop variant="transparent">
				<Modal.Container size="lg">
					<Modal.Dialog>
						<Modal.CloseTrigger />
						<Modal.Header>
							<Modal.Heading className="text-gray-900 dark:text-white">
								{`${DAYS[Number.parseInt(selectedCell.day)]}曜 ${selectedCell.period}限 の講義を選択`}
							</Modal.Heading>
						</Modal.Header>
						<Modal.Body>
							<div className="max-h-64 space-y-2 overflow-auto p-2">
								{isPending ? (
									<Loader />
								) : (
									availableCourses.map((course) => (
										<OutlineButton
											key={course.id}
											size="lg"
											onPress={() => onCourseSelect(course)}
										>
											<p className="font-medium text-gray-900 dark:text-white">
												{course.name}
											</p>
											<p className="text-gray-600 text-sm dark:text-gray-400">
												{course.targetGrade}年・{course.requirements}
											</p>
										</OutlineButton>
									))
								)}
								{!isPending && availableCourses.length === 0 && (
									<div className="py-8 text-center text-gray-500 dark:text-gray-400">
										<p>該当する講義が見つかりません</p>
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
