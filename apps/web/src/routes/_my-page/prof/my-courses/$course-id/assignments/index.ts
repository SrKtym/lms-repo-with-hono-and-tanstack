import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute(
	"/_my-page/prof/my-courses/$course-id/assignments/",
)({
	beforeLoad: ({ params }) => {
		throw redirect({
			to: "/prof/my-courses/$course-id",
			params: {
				"course-id": params["course-id"],
			},
		});
	},
});
