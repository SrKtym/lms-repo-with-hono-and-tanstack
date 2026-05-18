import type { FetchAnnouncementsFromUserCoursesReturnType } from "@lms-repo/db/utils/query/announcements";
import type { FetchAssignmentsFromUserCoursesReturnType } from "@lms-repo/db/utils/query/assignments";
import type { FetchRegisteredCoursesReturnType } from "@lms-repo/db/utils/query/courses";
import { ArrowLeft } from "@lms-repo/ui/assets/icons/arrow-left";
import { CancelButton } from "@lms-repo/ui/components/button";
import { AnnouncementCard } from "@lms-repo/ui/components/cards/announcement-card";
import { AssignmentCard } from "@lms-repo/ui/components/cards/assignment-card";
import { Image } from "@lms-repo/ui/components/image";
import { TabsForCourseInfo } from "@lms-repo/ui/components/tabs";
import { Link } from "@tanstack/react-router";
import { CreateAnnouncementForm } from "./create-announcement-form";
import { CreateAssignmentForm } from "./create-assignment-form";

const mockMembers = [
	{ id: 1, name: "Alice Johnson", role: "Student", avatar: "AJ" },
	{ id: 2, name: "Bob Smith", role: "Student", avatar: "BS" },
	{ id: 3, name: "Carol Davis", role: "Teaching Assistant", avatar: "CD" },
	{ id: 4, name: "Dr. Smith", role: "Instructor", avatar: "DS" },
];

interface RegisteredCourseInfosProps {
	courseWithCoverImage?: FetchRegisteredCoursesReturnType[number] & {
		coverImage?: string;
	};
	announcements: FetchAnnouncementsFromUserCoursesReturnType;
	assignments: FetchAssignmentsFromUserCoursesReturnType;
}

export default function RegisteredCourseInfos({
	courseWithCoverImage,
	announcements,
	assignments,
}: RegisteredCourseInfosProps) {
	if (!courseWithCoverImage) {
		return <div>講義が見つかりません。</div>;
	}
	const isTeacher = true;

	return (
		<>
			{/* Course Header */}
			<div className="relative flex h-48 items-end md:h-64">
				<div className="absolute inset-0">
					<Image
						src={courseWithCoverImage.coverImage || ""}
						layout="fullWidth"
						sizes="100vw"
						className="h-full w-full object-cover"
						alt="Course background"
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
					<div className="text-white">
						<h1 className="font-medium text-2xl md:text-3xl">
							{courseWithCoverImage.name}
						</h1>
						<p className="mt-1 text-white/80">
							{courseWithCoverImage.classRoom}
						</p>
						<p className="text-white/80">{courseWithCoverImage.professor}</p>
					</div>
				</div>
			</div>

			{/* Tab Navigation */}
			<div className="border-gray-200 border-b bg-white dark:border-gray-700 dark:bg-gray-800">
				<div className="container mx-auto max-w-screen-xl space-y-3 px-3 pt-1 pb-3">
					<TabsForCourseInfo
						announcementsTab={
							<div>
								<div className="mb-6 flex items-center justify-between">
									<h2 className="font-medium text-gray-900 text-xl dark:text-gray-100">
										お知らせ
									</h2>
									{isTeacher && <CreateAnnouncementForm />}
								</div>

								{announcements.length > 0 ? (
									<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
									{isTeacher && <CreateAssignmentForm />}
								</div>

								{assignments.length > 0 ? (
									<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
										{assignments.map((assignment) => (
											<Link
												key={assignment.id}
												to="/course-list/{-$course-id}/{-$content-id}"
												params={(prev) => ({
													...prev,
													"content-id": assignment.id,
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
