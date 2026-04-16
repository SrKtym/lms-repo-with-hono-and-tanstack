import { createFileRoute } from "@tanstack/react-router";
import Landing from "@/components/public/landing";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

function HomeComponent() {
	return <Landing />;
}
