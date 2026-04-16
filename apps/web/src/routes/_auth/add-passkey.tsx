import { createFileRoute } from "@tanstack/react-router";
import PasskeyCard from "@/components/public/passkey-card";

export const Route = createFileRoute("/_auth/add-passkey")({
	component: RouteComponent,
});

function RouteComponent() {
	return <PasskeyCard />;
}
