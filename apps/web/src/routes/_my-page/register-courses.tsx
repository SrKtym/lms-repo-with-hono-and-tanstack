import { createFileRoute } from "@tanstack/react-router";
import { RegisterTable } from "../../components/private/register-table";
import { client } from "@/lib/hono-client";

export const Route = createFileRoute("/_my-page/register-courses")({
	component: RouteComponent,
	loader: async () => {
		const courses = await client.api.courses.registered.$get();
		const data = await courses.json();
		return { courses: data };
	},
});

function RouteComponent() {
	const { courses } = Route.useLoaderData();
	return <RegisterTable courses={courses} />;
}
