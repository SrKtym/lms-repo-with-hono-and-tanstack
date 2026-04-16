import { ArrowLeft } from "@lms-repo/ui/assets/icons/arrow-left";
import { Settings } from "@lms-repo/ui/assets/icons/settings";
import { CancelButton, DefaultButton } from "@lms-repo/ui/components/button";
import { AnnouncementCard } from "@lms-repo/ui/components/cards/announcement-card";
import { AssignmentCard } from "@lms-repo/ui/components/cards/assignment-card";
import { Image } from "@lms-repo/ui/components/image";
import { TabsForCourseInfo } from "@lms-repo/ui/components/tabs";
import { Link } from "@tanstack/react-router";

// Mock data
const mockCourseData = {
	name: "Web Development",
	classroom: "Room 301",
	professor: "Dr. Smith",
	coverImage:
		"https://images.unsplash.com/photo-1516321318423-f06f85e504b3?fit=crop",
};

const mockAnnouncements = [
	{
		id: 1,
		title: "Welcome to Web Development Course",
		content:
			"Welcome everyone! This course covers modern web development technologies including HTML, CSS, JavaScript, and popular frameworks.",
		type: "Information",
		createdAt: new Date("2024-01-15"),
	},
	{
		id: 2,
		title: "Assignment 1 Due Date Extended",
		content:
			"Due to popular request, the due date for Assignment 1 has been extended to next Friday. Please make sure to submit on time.",
		type: "Assignment",
		createdAt: new Date("2024-01-20"),
	},
	{
		id: 3,
		title: "Survey: Course Feedback",
		content:
			"Please take a few minutes to complete the course feedback survey. Your input helps us improve the course for future students.",
		type: "Survey",
		createdAt: new Date("2024-01-18"),
	},
];

const mockAssignments = [
	{
		id: 1,
		title: "HTML & CSS Portfolio",
		description:
			"Create a personal portfolio website using HTML and CSS. Include at least 3 different pages with responsive design.",
		dueDate: new Date("2024-02-01"),
		points: 100,
		type: "Project",
	},
	{
		id: 2,
		title: "JavaScript Fundamentals Quiz",
		description:
			"Complete the online quiz covering basic JavaScript concepts including variables, functions, and DOM manipulation.",
		dueDate: new Date("2024-01-25"),
		points: 50,
		type: "Quiz",
	},
	{
		id: 3,
		title: "React Component Library",
		description:
			"Build a reusable component library using React. Include at least 5 different components with proper documentation.",
		dueDate: new Date("2024-02-15"),
		points: 150,
		type: "Project",
	},
	{
		id: 4,
		title: "API Integration Assignment",
		description:
			"Integrate a public API into your web application. Handle data fetching, error states, and loading indicators.",
		dueDate: new Date("2024-02-08"),
		points: 75,
		type: "Assignment",
	},
];

const mockMembers = [
	{ id: 1, name: "Alice Johnson", role: "Student", avatar: "AJ" },
	{ id: 2, name: "Bob Smith", role: "Student", avatar: "BS" },
	{ id: 3, name: "Carol Davis", role: "Teaching Assistant", avatar: "CD" },
	{ id: 4, name: "Dr. Smith", role: "Instructor", avatar: "DS" },
];

export default function RegisteredCourseInfos({
	courseId,
}: {
	courseId: string;
}) {
	const isTeacher = true;
	const options = ["お知らせ", "課題", "メンバー"];

	// Mock functions
	const course = mockCourseData;
	const coverImage = mockCourseData.coverImage;
	const announcements = mockAnnouncements;
	const assignmentData = mockAssignments;

	const handleCreateAnnouncement = () => {
		console.log("Create announcement clicked");
	};

	const handleCreateAssignment = () => {
		console.log("Create assignment clicked");
	};

	return (
		<>
			{/* Course Header */}
			<div className="relative flex h-48 items-end md:h-64">
				<div className="absolute inset-0">
					<Image
						src={coverImage}
						layout="fullWidth"
						sizes="100vw"
						className="h-full"
						alt="Course background"
						objectFit="cover"
						decoding="async"
						priority={true}
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
					<Link
						to="/course-list/{-$course-id}/{-$content-id}"
						params={(prev) => ({ ...prev, "course-id": undefined })}
						className="absolute top-4 left-4 flex items-center gap-1"
					>
						<CancelButton size="sm">
							<ArrowLeft />
							戻る
						</CancelButton>
					</Link>
				</div>
				<div className="container relative z-10 mx-auto max-w-screen-xl p-6">
					<div className="flex flex-col items-start justify-between md:flex-row md:items-end">
						<div className="text-white">
							<h1 className="font-medium text-2xl md:text-3xl">
								{course.name}
							</h1>
							<p className="mt-1 text-white/80">{course.classroom}</p>
							<p className="text-white/80">{course.professor}</p>
						</div>

						<div className="mt-4 md:mt-0">
							<DefaultButton className="border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20">
								<Settings width={16} height={16} />
								設定
							</DefaultButton>
						</div>
					</div>
				</div>
			</div>

			{/* Tab Navigation */}
			<div className="border-gray-200 border-b bg-white dark:border-gray-700 dark:bg-gray-800">
				<div className="container mx-auto max-w-screen-xl space-y-3 px-3 pt-1 pb-3">
					<TabsForCourseInfo
						options={options}
						announcementsTab={
							<div>
								<div className="mb-6 flex items-center justify-between">
									<h2 className="font-medium text-gray-900 text-xl dark:text-gray-100">
										お知らせ
									</h2>
									{isTeacher && (
										<DefaultButton onClick={handleCreateAnnouncement}>
											お知らせを作成
										</DefaultButton>
									)}
								</div>

								{announcements.length > 0 ? (
									<div className="space-y-4">
										{announcements.map((announcement) => (
											<AnnouncementCard
												key={announcement.id}
												data={announcement}
											/>
										))}
									</div>
								) : (
									<div className="py-12 text-center">
										<p className="text-gray-500 dark:text-gray-400">
											お知らせはまだありません
										</p>
									</div>
								)}
							</div>
						}
						assignmentsTab={
							<div>
								<div className="mb-6 flex items-center justify-between">
									<h2 className="font-medium text-gray-900 text-xl dark:text-gray-100">
										課題
									</h2>
									{isTeacher && (
										<DefaultButton onClick={handleCreateAssignment}>
											課題を作成
										</DefaultButton>
									)}
								</div>

								{assignmentData.length > 0 ? (
									<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
										{assignmentData.map((assignment) => (
											<Link
												key={assignment.id}
												to="/course-list/{-$course-id}/{-$content-id}"
												params={(prev) => ({
													...prev,
													"content-id": assignment.id.toString(),
												})}
												className="block"
											>
												<AssignmentCard
													key={assignment.id}
													assignment={assignment}
												/>
											</Link>
										))}
									</div>
								) : (
									<div className="py-12 text-center">
										<p className="text-gray-500 dark:text-gray-400">
											まだ課題がありません
										</p>
									</div>
								)}
							</div>
						}
						membersTab={
							<div>
								<h2 className="mb-6 font-medium text-gray-900 text-xl dark:text-gray-100">
									コースメンバー
								</h2>

								{mockMembers.length > 0 ? (
									<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
										{mockMembers.map((member) => (
											<div
												key={member.id}
												className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
											>
												<div className="flex items-center space-x-3">
													<div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
														<span className="font-medium text-blue-600 dark:text-blue-400">
															{member.avatar}
														</span>
													</div>
													<div>
														<h3 className="font-medium text-gray-900 dark:text-gray-100">
															{member.name}
														</h3>
														<p className="text-gray-500 text-sm dark:text-gray-400">
															{member.role}
														</p>
													</div>
												</div>
											</div>
										))}
									</div>
								) : (
									<div className="py-12 text-center">
										<p className="text-gray-500 dark:text-gray-400">
											受講者はいません
										</p>
									</div>
								)}
							</div>
						}
					/>
				</div>
			</div>
		</>
	);
}
