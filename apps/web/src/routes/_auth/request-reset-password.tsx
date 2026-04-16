import { createFileRoute } from "@tanstack/react-router";
import RequestResetPasswordForm from "@/components/public/request-reset-password-form";

export const Route = createFileRoute("/_auth/request-reset-password")({
	component: RouteComponent,
});

function RouteComponent() {
	return <RequestResetPasswordForm />;
}
