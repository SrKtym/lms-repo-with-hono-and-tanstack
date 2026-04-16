import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/set-twofactor")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/_auth/set-twofactor"!</div>;
}
