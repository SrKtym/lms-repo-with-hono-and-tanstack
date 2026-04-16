import { createFileRoute } from "@tanstack/react-router";
import { RegisterTable } from "../../components/private/register-table";

export const Route = createFileRoute("/_my-page/register-courses")({
	component: RouteComponent,
});

function RouteComponent() {
	return <RegisterTable />;
}
