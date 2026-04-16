import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
	"/_auth/set-twofactor/register-totp-secretkey",
)({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/_auth/set-twofactor/register-totp-secretkey"!</div>;
}
