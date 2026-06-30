import { Modal } from "@heroui/react";
import type {
	FetchCoursesReturnType,
	FetchRegisteredCoursesReturnType,
} from "@lms-repo/db/utils/query/courses";
import { useInfiniteScroll } from "@lms-repo/ui/hooks/use-infinite-scroll";
import { DAYS } from "../../lib/utils";
import { CancelButton, OutlineButton } from "../button";
import { Loader } from "../loader";

interface CourseSelectionModalProps {
	onCourseSelect: (course: FetchCoursesReturnType[number]) => void;
	selectedCell: { day: number; period: number };
	availableCourses: FetchCoursesReturnType;
	registeredCourses?: FetchRegisteredCoursesReturnType;
	isPending?: boolean;
	hasNextPage?: boolean;
	fetchNextPage?: () => void;
	isFetchingNextPage?: boolean;
	isOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
}

// Course selection modal
export function CourseSelectionModal({
	onCourseSelect,
	selectedCell,
	availableCourses,
	registeredCourses,
	isPending = false,
	hasNextPage = false,
	fetchNextPage,
	isFetchingNextPage = false,
	isOpen,
	onOpenChange,
}: CourseSelectionModalProps) {
	const sentinelRef = useInfiniteScroll({
		hasNextPage,
		isFetchingNextPage,
		fetchNextPage,
	});

	return (
		<Modal.Backdrop
			variant="transparent"
			isOpen={isOpen}
			onOpenChange={onOpenChange}
		>
			<Modal.Container size="lg">
				<Modal.Dialog>
					<Modal.CloseTrigger />
					<Modal.Header>
						<Modal.Heading>
							{`${DAYS[selectedCell.day]}曜 ${selectedCell.period}限 の講義を選択`}
						</Modal.Heading>
					</Modal.Header>
					<Modal.Body>
						<div className="max-h-64 space-y-2 overflow-auto p-2">
							{isPending ? (
								<Loader />
							) : (
								<>
									{availableCourses.map((course) => {
										const isRegistered = registeredCourses?.some(
											(registered) => registered.id === course.id,
										);
										return (
											<OutlineButton
												key={course.id}
												size="lg"
												isDisabled={isRegistered}
												onPress={() => onCourseSelect(course)}
											>
												<p className="font-medium text-gray-900 dark:text-white">
													{course.name}
												</p>
												<p className="text-gray-600 text-sm dark:text-gray-400">
													{course.targetGrade}年・{course.requirements}
												</p>
											</OutlineButton>
										);
									})}
									{/* スクロール後、追加データを読み込む間はローダーを表示 */}
									{hasNextPage && (
										<div ref={sentinelRef} className="py-2">
											{isPending && <Loader />}
										</div>
									)}
									{/* データが存在しない場合 */}
									{!isPending && availableCourses.length === 0 && (
										<p className="py-8 text-center text-gray-500 dark:text-gray-400">
											該当する講義が見つかりません
										</p>
									)}
								</>
							)}
						</div>
					</Modal.Body>
					<Modal.Footer>
						<CancelButton slot="close">キャンセル</CancelButton>
					</Modal.Footer>
				</Modal.Dialog>
			</Modal.Container>
		</Modal.Backdrop>
	);
}
