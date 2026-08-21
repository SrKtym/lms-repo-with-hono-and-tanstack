// 教員用レイアウト

import { ControlledModal } from "@lms-repo/ui/components/modals/controlled-modal";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { CreateProfDataForm } from "@/components/_my-page/_prof/shared/create-prof-data-form";
import { QUERY_CONFIG, queryClient } from "@/lib/query-client";
import { fetchProfDataQueryFn } from "@/utils/query/professors";
import { asyncStoragePersister } from "../_student/route";

export const Route = createFileRoute("/_my-page/_prof")({
	component: ProfLayoutComponent,
	loader: async ({ context }) => {
		if (!context.session.data?.user) {
			throw new Error("ユーザーが見つかりません");
		}
		const { role } = context.session.data.user;

		if (role === "student") {
			redirect({
				to: "/",
				throw: true,
			});
		}

		const profData = await queryClient.ensureQueryData({
			queryKey: ["profData"],
			queryFn: async () => {
				const data = await fetchProfDataQueryFn();
				return data;
			},
			...QUERY_CONFIG.USER_DATA,
		});

		return { role, profData };
	},
});

function ProfLayoutComponent() {
	const { profData } = Route.useLoaderData();
	const noData = "message" in profData;

	return (
		<PersistQueryClientProvider
			client={queryClient}
			persistOptions={{
				persister: asyncStoragePersister,
				dehydrateOptions: {
					// 特定のクエリキーのみを永続化
					shouldDehydrateQuery: (query) => {
						// 成功したクエリのみ
						if (query.state.status !== "success") {
							return false;
						}
						// studentDataのみを永続化
						const queryKey = query.queryKey;
						const filteredQueryKey = queryKey.filter(
							(key) => key === "profData",
						);
						return filteredQueryKey.length > 0;
					},
					// ミューテーションは永恒化しない
					shouldDehydrateMutation: () => false,
				},
				// 24時間キャッシュを保持
				maxAge: 1000 * 60 * 60 * 24,
			}}
		>
			{noData && (
				<ControlledModal
					isOpen={true}
					heading="学科の登録をしましょう"
					size="cover"
					showCloseTrigger={false}
				>
					<CreateProfDataForm />
				</ControlledModal>
			)}
			<Outlet />
		</PersistQueryClientProvider>
	);
}
