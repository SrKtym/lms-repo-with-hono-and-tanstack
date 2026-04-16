import { createFileRoute } from "@tanstack/react-router";
import { Notifications } from "@/components/private/notifications";

export const Route = createFileRoute("/_my-page/notifications")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<Notifications
			notifications={[
				{
					id: "1",
					title: "テスト",
					message: "テスト",
					type: "info",
					read: false,
					timestamp: new Date(),
				},
				{
					id: "2",
					title: "テスト2",
					message: "テスト2",
					type: "info",
					read: true,
					timestamp: new Date(),
				},
			]}
		/>
	);
}
