import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_my-page/prof/")({
	beforeLoad: () => {
		throw redirect({ to: "/prof/my-courses" });
	},
});
