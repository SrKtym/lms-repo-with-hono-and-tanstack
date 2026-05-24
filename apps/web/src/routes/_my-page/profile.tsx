import { authClient } from "@lms-repo/auth/web";
import { AccountSettings } from "@lms-repo/ui/components/surfaces/account-settings";
import { NotificationSettings } from "@lms-repo/ui/components/surfaces/notification-settings";
import { UserProfileInfo } from "@lms-repo/ui/components/surfaces/user-profile-info";
import { TabsForProfile } from "@lms-repo/ui/components/tabs";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useUpdateEmailNotificationSettings } from "@/hooks/settings";
import { queryClient } from "@/lib/query-client";
import {
	fetchCompletedCoursesQueryFn,
	fetchEmailNotificationSettingsQueryFn,
	fetchStudentDataQueryFn,
} from "@/utils/query-utils";

export const Route = createFileRoute("/_my-page/profile")({
	component: RouteComponent,
	loader: async ({ context }) => {
		if (!context.session.data?.user) {
			throw new Error("User not found");
		}
		const { email, name, image, role } = context.session.data.user;

		const [studentData, completedCourses, emailNotificationSettings] =
			await Promise.all([
				queryClient.ensureQueryData({
					queryKey: ["studentData"],
					queryFn: fetchStudentDataQueryFn,
					staleTime: 1000 * 60 * 60 * 24, // 24時間は「新鮮」と見なす
					gcTime: 1000 * 60 * 60 * 24 * 7, // 7日間はキャッシュを保持
				}),
				queryClient.ensureQueryData({
					queryKey: ["totalCredits"],
					queryFn: fetchCompletedCoursesQueryFn,
					staleTime: 1000 * 60 * 60 * 24, // 24時間は「新鮮」と見なす
					gcTime: 1000 * 60 * 60 * 24 * 7, // 7日間はキャッシュを保持
				}),
				queryClient.ensureQueryData({
					queryKey: ["email-notification-settings"],
					queryFn: fetchEmailNotificationSettingsQueryFn,
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
			emailNotificationSettings,
		};
	},
});

function RouteComponent() {
	const {
		studentData,
		completedCourses,
		emailNotificationSettings,
		...userData
	} = Route.useLoaderData();
	const user = { ...userData, ...completedCourses[0], ...studentData[0] };

	// アカウント削除処理
	const handleDeleteAccount = async () => {
		await authClient.deleteUser({
			callbackURL: "/",
		});
	};

	// メール通知設定変更時の処理
	const { mutate: updateEmailNotificationSettings } =
		useUpdateEmailNotificationSettings();

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
				accountSettingsTab={
					<AccountSettings
						LinkComponent={Link}
						onDeleteAccount={handleDeleteAccount}
					/>
				}
				notificationSettingsTab={
					<NotificationSettings
						initialSettings={emailNotificationSettings}
						onSettingsChange={updateEmailNotificationSettings}
					/>
				}
			/>
		</div>
	);
}
