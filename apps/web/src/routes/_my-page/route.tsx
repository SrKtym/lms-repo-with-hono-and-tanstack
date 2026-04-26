// マイページレイアウト

import { authClient } from "@lms-repo/auth/web";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Header } from "@/components/header";
import { queryClient } from "@/lib/query-client";

export const Route = createFileRoute("/_my-page")({
	component: MyPageLayoutComponent,
	beforeLoad: async () => {
		// セッションデータをキャッシュまたは取得
		const session = await queryClient.ensureQueryData({
			queryKey: ["session"],
			queryFn: async () => {
				const res = await authClient.getSession();
				return res;
			},
			staleTime: 5 * 60 * 1000, // 5 minutes
			gcTime: 10 * 60 * 1000, // 10 minutes
		});

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
