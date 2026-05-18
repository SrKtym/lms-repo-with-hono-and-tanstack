import { AccountSettings } from "@lms-repo/ui/components/surfaces/account-settings";
import { NotificationSettings } from "@lms-repo/ui/components/surfaces/notification-settings";
import { UserProfileInfo } from "@lms-repo/ui/components/surfaces/user-profile-info";
import { TabsForProfile } from "@lms-repo/ui/components/tabs";
import { createFileRoute, Link } from "@tanstack/react-router";
import { queryClient } from "@/lib/query-client";
import {
	fetchCompletedCoursesQueryFn,
	fetchStudentDataQueryFn,
} from "@/utils/query-utils";

export const Route = createFileRoute("/_my-page/profile")({
	component: RouteComponent,
	loader: async ({ context }) => {
		if (!context.session.data?.user) {
			throw new Error("User not found");
		}
		const { email, name, image, role } = context.session.data.user;

		const [studentData, completedCourses] = await Promise.all([
			queryClient.ensureQueryData({
				queryKey: ["studentData"],
				queryFn: async () => {
					const data = await fetchStudentDataQueryFn();
					return data;
				},
				staleTime: 1000 * 60 * 60 * 24, // 24時間は「新鮮」と見なす
				gcTime: 1000 * 60 * 60 * 24 * 7, // 7日間はキャッシュを保持
			}),
			queryClient.ensureQueryData({
				queryKey: ["totalCredits"],
				queryFn: async () => {
					const data = await fetchCompletedCoursesQueryFn();
					return data;
				},
				staleTime: 1000 * 60 * 60 * 24, // 24時間は「新鮮」と見なす
				gcTime: 1000 * 60 * 60 * 24 * 7, // 7日間はキャッシュを保持
			}),
		]);

		return {
			email,
			name,
			image,
			role,
			studentData,
			completedCourses,
		};
	},
});

function RouteComponent() {
	const { studentData, completedCourses, ...userData } = Route.useLoaderData();
	const user = { ...userData, ...completedCourses[0], ...studentData[0] };

	const handleNotificationSettingsChange = (settings: any) => {
		// 通知設定を保存
		console.log("通知設定更新:", settings);
	};

	return (
		<div className="container mx-auto max-w-6xl px-4 py-8">
			{/* ページタイトル */}
			<div className="mb-8">
				<h1 className="mb-2 font-bold text-3xl text-foreground">
					プロフィール
				</h1>
				<p className="text-foreground-600">
					ユーザー情報の確認とアカウント設定の管理
				</p>
			</div>

			{/* タブコンテンツ */}
			<TabsForProfile
				profileTab={<UserProfileInfo user={user} />}
				accountSettingsTab={<AccountSettings LinkComponent={Link} />}
				notificationSettingsTab={
					<NotificationSettings
						onSettingsChange={handleNotificationSettingsChange}
					/>
				}
			/>
		</div>
	);
}
