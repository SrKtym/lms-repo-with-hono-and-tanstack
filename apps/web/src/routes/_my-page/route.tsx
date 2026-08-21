// マイページレイアウト

import { authClient } from "@lms-repo/auth/web";
import { Toast } from "@lms-repo/ui/components/toast";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Header } from "@/components/_my-page/shared/header";
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
		});

		if (!session.data) {
			redirect({
				to: "/sign-in",
				throw: true,
			});
		}

		return { session };
	},
	loader: async ({ context }) => {
		if (!context.session.data?.user) {
			throw new Error("ユーザーが見つかりません");
		}
		const { email, name, image, role } = context.session.data.user;

		return { email, name, image, role };
	},
});

function MyPageLayoutComponent() {
	const { role, ...userData } = Route.useLoaderData();

	return (
		<div className="relative min-h-screen">
			{/* Background - inherited from __root.tsx */}
			{/* Content */}
			<Toast.Provider placement="top" />
			<div className="relative z-10 flex flex-col">
				<Header role={role} {...userData} />
				<div className="flex-1">
					<Outlet />
				</div>
				{/* Footer */}
				<div className="mt-8 text-center">
					<p className="p-4 text-gray-500 text-sm dark:text-gray-400">
						&copy; 2026 LMS. All rights reserved.
					</p>
				</div>
			</div>
		</div>
	);
}
