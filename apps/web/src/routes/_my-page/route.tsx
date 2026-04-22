// ダッシュボードレイアウト
import { authClient } from "@lms-repo/auth/web";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Header } from "@/components/header";

export const Route = createFileRoute("/_my-page")({
	component: MyPageLayoutComponent,
	beforeLoad: async () => {
		const session = await authClient.getSession();
		if (!session.data) {
			redirect({
				to: "/sign-in",
				throw: true,
			});
		}
		return { session };
	},
	loader: ({ context }) => {
		if (!context.session.data?.user) {
			throw new Error("User not found");
		}
		const { email, name, image } = context.session.data.user;
		return { email, name, image };
	},
});

function MyPageLayoutComponent() {
	const userData = Route.useLoaderData();

	return (
		<div className="relative min-h-screen">
			{/* Background - inherited from __root.tsx */}
			{/* Content */}
			<div className="relative z-10 flex flex-col">
				<Header {...userData} />
				<main className="flex-1">
					<Outlet />
				</main>
			</div>
		</div>
	);
}
