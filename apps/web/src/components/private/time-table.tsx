import { TimeTableCard } from "@lms-repo/ui/components/cards/time-table-card";
import * as m from "motion/react-m";

interface TimeTableProps {
	courses?: any[];
	onEditCourse?: (course: any) => void;
	onDeleteCourse?: (courseId: string) => void;
	onCellClick?: (day: string, period: string) => void;
	confirmModal: React.ReactNode;
}

export function TimeTable({
	courses: externalCourses,
	onEditCourse,
	onDeleteCourse,
	onCellClick,
	confirmModal,
}: TimeTableProps) {
	return (
		<div className="space-y-4">
			<m.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
				className="flex items-center justify-between"
			>
				<h2 className="font-bold text-xl">時間割</h2>
				<m.div
					key={externalCourses?.length || 0}
					initial={{ scale: 0.8, opacity: 0 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.2 }}
					className="flex items-center gap-4 text-gray-600 text-sm dark:text-gray-400"
				>
					<p>登録済み講義: {externalCourses?.length || 0}件</p>
					{externalCourses?.length && confirmModal}
				</m.div>
			</m.div>

			<m.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.3, delay: 0.1 }}
			>
				<TimeTableCard
					courses={externalCourses}
					onEditCourse={onEditCourse}
					onDeleteCourse={onDeleteCourse}
					onCellClick={onCellClick}
				/>
			</m.div>
		</div>
	);
}
