import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/about-reset-password")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/_auth-layout/about-reset-password"!</div>;
}
