import { ArrowLeft } from "@lms-repo/ui/assets/icons/arrow-left";
import { CancelButton } from "@lms-repo/ui/components/button";
import { AssignmentDetailCard } from "@lms-repo/ui/components/cards/assignment-detail-card";
import { CommentsCard } from "@lms-repo/ui/components/cards/comments-card";
import { SubmissionsCard } from "@lms-repo/ui/components/cards/submissions-card";
import { TabsForSubmissions } from "@lms-repo/ui/components/tabs";
import { createFileRoute, Link } from "@tanstack/react-router";
import * as m from "motion/react-m";
import { CreateFileSubmissionForm } from "@/components/_my-page/_student/my-courses/create-file-submission-form";
import { CreateTextSubmissionForm } from "@/components/_my-page/_student/my-courses/create-text-submission-form";
import { CreateCommentForm } from "@/components/_my-page/shared/create-comment-form";
import { useCommentsWithAssignment } from "@/hooks/comments";
import { queryClient } from "@/lib/query-client";
import { fetchAssignmentsQueryFn } from "@/utils/query/assignments";
import { fetchSubmissionsStatusQueryFn } from "@/utils/query/submissions";

export const Route = createFileRoute(
	"/_my-page/_student/my-courses/$course-id/assignments/$assignment-id",
)({
	component: RouteComponent,
	loader: async ({
		params: { "course-id": courseId, "assignment-id": assignmentId },
	}) => {
		const [assignments, submission] = await Promise.all([
			queryClient.ensureQueryData({
				queryKey: ["assignments-related-courses"],
				queryFn: () => fetchAssignmentsQueryFn(courseId),
			}),
			queryClient.ensureQueryData({
				queryKey: ["submissions-status", assignmentId],
				queryFn: () => fetchSubmissionsStatusQueryFn(assignmentId),
			}),
		]);

		return { assignments, submission };
	},
	head: ({ match }) => {
		const assignmentTitle = match.loaderData?.assignments?.find(
			({ id }) => id === match.params["assignment-id"],
		)?.title;

		return {
			meta: [
				{
					title: `${assignmentTitle || "課題詳細"} | LMS-repo`,
				},
			],
		};
	},
});

function RouteComponent() {
	const { "assignment-id": assignmentId } = Route.useParams();
	const { assignments, submission } = Route.useLoaderData();

	const targetAssignment = assignments.find(
		(assignment) => assignment.id === assignmentId,
	);

	if (!targetAssignment) {
		throw new Error("課題が見つかりません");
	}

	const targetSubmission = submission[0];

	const propaties = {
		initial: { opacity: 0, y: 10 },
		animate: { opacity: 1, y: 0 },
		transition: { duration: 0.3 },
	};

	const { data: comments = [] } = useCommentsWithAssignment(assignmentId);

	return (
		<div className="space-y-8 pb-12">
			{/* ヘッダー */}
			<div className="assignment-detail-header">
				<div />
				<div>
					<div className="flex items-center space-x-4">
						<Link
							to="/my-courses/$course-id"
							params={{
								"course-id": targetAssignment?.courseId || "",
							}}
							className="flex items-center gap-1"
						>
							<CancelButton size="sm">
								<ArrowLeft />
								戻る
							</CancelButton>
						</Link>
						{targetAssignment && (
							<div className="text-sm text-white opacity-80">
								{targetAssignment.courseName} / 課題の詳細
							</div>
						)}
					</div>
				</div>
			</div>

			<div className="assignment-detail-content">
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
					{/* 課題の詳細 */}
					<m.div {...propaties} className="lg:col-span-2">
						<AssignmentDetailCard
							targetAssignment={targetAssignment}
							score={targetSubmission?.score}
						/>
					</m.div>

					{/* 提出（学生用） */}
					<m.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3, delay: 0.1 }}
					>
						<SubmissionsCard
							targetAssignment={targetAssignment}
							targetSubmission={targetSubmission}
						>
							<div className="space-y-2">
								<TabsForSubmissions
									textTab={
										<CreateTextSubmissionForm assignmentId={assignmentId} />
									}
									attachmentsTab={
										<CreateFileSubmissionForm assignmentId={assignmentId} />
									}
								/>
							</div>
						</SubmissionsCard>
					</m.div>

					{/* コメント */}
					<m.div
						{...propaties}
						transition={{ ...propaties.transition, delay: 0.2 }}
					>
						<CommentsCard comments={comments}>
							<CreateCommentForm assignmentId={assignmentId} />
						</CommentsCard>
					</m.div>
				</div>
			</div>
		</div>
	);
}
