import { ArrowLeft } from "@lms-repo/ui/assets/icons/arrow-left";
import { DefaultAvatar } from "@lms-repo/ui/components/avatar";
import { CancelButton } from "@lms-repo/ui/components/button";
import { AnnouncementCard } from "@lms-repo/ui/components/cards/announcement-card";
import { AssignmentCard } from "@lms-repo/ui/components/cards/assignment-card";
import { Image } from "@lms-repo/ui/components/image";
import { Loader } from "@lms-repo/ui/components/loader";
import { TabsForCourseInfo } from "@lms-repo/ui/components/tabs";
import { addCoverImagesToCourses } from "@lms-repo/ui/lib/utils";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useAnnouncements } from "@/hooks/announcements";
import { useAssignments } from "@/hooks/assignments";
import { useMembersByCourseId } from "@/hooks/students";
import { QUERY_CONFIG, queryClient } from "@/lib/query-client";
import { fetchAnnouncementsQueryFn } from "@/utils/query/announcements";
import { fetchAssignmentsQueryFn } from "@/utils/query/assignments";
import { fetchRegisteredCoursesQueryFn } from "@/utils/query/courses";

export const Route = createFileRoute(
	"/_my-page/_student/my-courses/$course-id/",
)({
	component: RouteComponent,
	loader: async ({ params: { "course-id": courseId } }) => {
		const [courses, announcements, assignments] = await Promise.all([
			queryClient.ensureQueryData({
				queryKey: ["registered-courses"],
				queryFn: fetchRegisteredCoursesQueryFn,
				...QUERY_CONFIG.USER_DATA,
			}),
			queryClient.ensureQueryData({
				queryKey: ["announcements-related-courses"],
				queryFn: () => fetchAnnouncementsQueryFn(courseId),
			}),
			queryClient.ensureQueryData({
				queryKey: ["assignments-related-courses"],
				queryFn: () => fetchAssignmentsQueryFn(courseId),
			}),
		]);

		return { courses, announcements, assignments };
	},
	head: ({ match }) => {
		const courseName =
			match.loaderData?.courses?.find(
				({ id }) => id === match.params["course-id"],
			)?.name || "講義詳細";

		return {
			meta: [
				{
					title: `${courseName} | LMS-repo`,
				},
			],
		};
	},
});

function RouteComponent() {
	const { "course-id": courseId } = Route.useParams();
	const { courses, announcements, assignments } = Route.useLoaderData();

	const coursesWithCoverImage = addCoverImagesToCourses(courses);

	const targetCourse = coursesWithCoverImage.find(
		(course) => course.id === courseId,
	);

	if (!targetCourse) {
		throw new Error("講義が見つかりません");
	}

	const { data: announcementsData = [] } = useAnnouncements(announcements);
	const { data: assignmentsData = [] } = useAssignments(assignments);
	const { data: members = [], isPending } = useMembersByCourseId(courseId);

	const targetAnnouncements = announcementsData.filter(
		(announcement) => announcement.courseId === courseId,
	);
	const targetAssignments = assignmentsData.filter(
		(assignment) => assignment.courseId === courseId,
	);

	return (
		<>
			{/* Course Header */}
			<div className="relative flex h-48 items-end md:h-64">
				<div className="absolute inset-0">
					<Image
						src={targetCourse.coverImage || ""}
						layout="fullWidth"
						sizes="100vw"
						className="h-full w-full object-cover"
						alt="Course background"
						decoding="async"
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
					<Link
						to="/my-courses"
						className="absolute top-4 left-4 flex items-center gap-1"
					>
						<CancelButton size="sm">
							<ArrowLeft />
							戻る
						</CancelButton>
					</Link>
				</div>
				<div className="relative z-10 container mx-auto max-w-screen-xl p-6">
					<div className="text-white">
						<h1 className="text-2xl font-medium md:text-3xl">
							{targetCourse?.name}
						</h1>
						<p className="mt-1 text-white/80">{targetCourse.classRoom}</p>
						<p className="text-white/80">{targetCourse.professor}</p>
					</div>
				</div>
			</div>

			{/* Tab Navigation */}
			<div className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
				<div className="container mx-auto max-w-screen-xl space-y-3 px-3 pt-1 pb-3">
					<TabsForCourseInfo
						announcementsTab={
							<>
								<div className="mb-6 flex items-center justify-between">
									<h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">
										お知らせ
									</h2>
								</div>

								{targetAnnouncements.length > 0 ? (
									<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
										{targetAnnouncements.map((announcement) => (
											<AnnouncementCard
												key={announcement.id}
												announcement={announcement}
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
							</>
						}
						assignmentsTab={
							<>
								<div className="mb-6 flex items-center justify-between">
									<h2 className="text-xl font-medium text-gray-900 dark:text-gray-100">
										課題
									</h2>
								</div>

								{targetAssignments.length > 0 ? (
									<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
										{targetAssignments.map((assignment) => (
											<Link
												key={assignment.id}
												to="/my-courses/$course-id/assignments/$assignment-id"
												params={{
													"course-id": courseId,
													"assignment-id": assignment.id,
												}}
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
							</>
						}
						membersTab={
							<>
								<h2 className="mb-6 text-xl font-medium text-gray-900 dark:text-gray-100">
									コースメンバー
								</h2>
								{members.length > 0 ? (
									<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
										{isPending ? (
											<Loader />
										) : (
											members.map((member) => (
												<div
													key={member.id}
													className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
												>
													<div className="flex items-center space-x-3">
														<div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
															<DefaultAvatar
																src={member.avatar}
																userName={member.name}
															/>
														</div>
														<h3 className="font-medium text-gray-900 dark:text-gray-100">
															{member.name}
														</h3>
													</div>
												</div>
											))
										)}
									</div>
								) : (
									<div className="py-12 text-center">
										<p className="text-gray-500 dark:text-gray-400">
											受講者はいません
										</p>
									</div>
								)}
							</>
						}
					/>
				</div>
			</div>
		</>
	);
}
