import { OutlineButton } from "@lms-repo/ui/components/button";
import * as m from "motion/react-m";

interface CourseModalProps {
	onClose: () => void;
	onSelectCourse: (course: string) => void;
	courseRef: React.RefObject<HTMLButtonElement | null>;
}

const mockCourses = [
	{
		id: "1",
		name: "Webアプリケーション開発",
		professor: "田中教授",
		credits: 2,
	},
	{ id: "2", name: "データベース論", professor: "鈴木教授", credits: 2 },
	{
		id: "3",
		name: "アルゴリズムとデータ構造",
		professor: "佐藤教授",
		credits: 2,
	},
];

export function CourseModal({
	onClose,
	onSelectCourse,
	courseRef,
}: CourseModalProps) {
	return (
		<m.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.2 }}
			className="absolute inset-0 z-20 flex items-center justify-center"
			onClick={onClose}
		>
			<m.div
				initial={{ scale: 0.95, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				exit={{ scale: 0.95, opacity: 0 }}
				transition={{ duration: 0.2 }}
				className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800"
				onClick={(e) => e.stopPropagation()}
			>
				<h3 className="mb-4 font-bold text-gray-900 text-lg dark:text-white">
					月曜 3限の講義を選択
				</h3>
				<div className="space-y-2">
					{mockCourses.map((course) => (
						<OutlineButton
							key={course.id}
							onPress={() => onSelectCourse(course.name)}
							ref={course.id === "1" ? courseRef : undefined}
						>
							<p className="font-medium text-gray-900 text-sm dark:text-white">
								{course.name}
							</p>
							<p className="text-gray-600 text-xs dark:text-gray-400">
								{course.professor} • {course.credits}単位
							</p>
						</OutlineButton>
					))}
				</div>
			</m.div>
		</m.div>
	);
}
