import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute(
	"/_my-page/_student/my-courses/$course-id/assignments/",
)({
	beforeLoad: ({ params }) => {
		throw redirect({
			to: "/my-courses/$course-id",
			params: {
				"course-id": params["course-id"],
			},
		});
	},
});
