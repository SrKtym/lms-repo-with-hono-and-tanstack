// 学生用レイアウト
import { ControlledModal } from "@lms-repo/ui/components/modals/controlled-modal";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { CreateStudentDataForm } from "@/components/_my-page/_student/shared/create-student-data-form";
import {
	asyncStoragePersister,
	QUERY_CONFIG,
	queryClient,
} from "@/lib/query-client";
import { fetchStudentDataQueryFn } from "@/utils/query/students";

export const Route = createFileRoute("/_my-page/_student")({
	component: StudentLayoutComponent,
	beforeLoad: ({ context: { role } }) => {
		if (role === "professor") {
			redirect({
				to: "/course-management",
				throw: true,
			});
		}
	},
	loader: async () => {
		const studentData = await queryClient.ensureQueryData({
			queryKey: ["studentData"],
			queryFn: async () => {
				const data = await fetchStudentDataQueryFn();
				return data;
			},
			...QUERY_CONFIG.USER_DATA,
		});
		return { studentData };
	},
});

function StudentLayoutComponent() {
	const { studentData } = Route.useLoaderData();
	const noData = "error" in studentData;

	return (
		<>
			{/* Content */}
			<div className="relative z-10 flex flex-col">
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
									(key) =>
										key === "studentData" ||
										key === "totalCredits" ||
										key === "email-notification-settings" ||
										key === "registered-courses",
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
							heading="学科・学年の登録をしましょう"
							size="cover"
							showCloseTrigger={false}
						>
							<CreateStudentDataForm />
						</ControlledModal>
					)}
					<Outlet />
				</PersistQueryClientProvider>
			</div>
		</>
	);
}
