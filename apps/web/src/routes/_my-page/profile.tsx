import { authClient } from "@lms-repo/auth/web";
import { env } from "@lms-repo/env/web";
import { DefaultButton } from "@lms-repo/ui/components/button";
import { ControlledModal } from "@lms-repo/ui/components/modals/controlled-modal";
import { AccountSettings } from "@lms-repo/ui/components/surfaces/account-settings";
import { NotificationSettings } from "@lms-repo/ui/components/surfaces/notification-settings";
import { UserProfileInfo } from "@lms-repo/ui/components/surfaces/user-profile-info";
import { TabsForProfile } from "@lms-repo/ui/components/tabs";
import { toast } from "@lms-repo/ui/components/toast";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CreateStudentDataForm } from "@/components/_my-page/_student/shared/create-student-data-form";
import { CreateProfDataForm } from "@/components/_my-page/prof/shared/create-prof-data-form";
import {
	useEmailNotificationSettings,
	useUpdateEmailNotificationSettings,
} from "@/hooks/settings";
import { QUERY_CONFIG, queryClient } from "@/lib/query-client";
import { requestRoleChangeMutationFn } from "@/utils/mutation/students";
import { fetchCompletedCreditsQueryFn } from "@/utils/query/courses";
import { fetchProfDataQueryFn } from "@/utils/query/professors";
import { fetchEmailNotificationSettingsQueryFn } from "@/utils/query/settings";
import { fetchStudentDataQueryFn } from "@/utils/query/students";

export const Route = createFileRoute("/_my-page/profile")({
	component: RouteComponent,
	loader: async ({ context }) => {
		const { email, name, image, role } = context;

		const [profileData, completedCourses, initialSettings] = await Promise.all([
			role === "professor"
				? queryClient.ensureQueryData({
						queryKey: ["profData"],
						queryFn: fetchProfDataQueryFn,
						...QUERY_CONFIG.USER_DATA,
					})
				: queryClient.ensureQueryData({
						queryKey: ["studentData"],
						queryFn: fetchStudentDataQueryFn,
						...QUERY_CONFIG.USER_DATA,
					}),
			role === "student"
				? queryClient.ensureQueryData({
						queryKey: ["totalCredits"],
						queryFn: fetchCompletedCreditsQueryFn,
						...QUERY_CONFIG.USER_DATA,
					})
				: null,
			queryClient.ensureQueryData({
				queryKey: ["email-notification-settings"],
				queryFn: fetchEmailNotificationSettingsQueryFn,
				...QUERY_CONFIG.USER_DATA,
			}),
		]);

		return {
			email,
			name,
			image,
			role,
			profileData,
			completedCourses,
			initialSettings,
		};
	},
	head: () => ({
		meta: [
			{
				title: "プロフィール | LMS-repo",
			},
		],
	}),
});

function RouteComponent() {
	const { profileData, completedCourses, initialSettings, ...userData } =
		Route.useLoaderData();
	const noData = "error" in profileData;
	const user = { ...userData, ...completedCourses, ...profileData };

	// トースト表示
	function showToast(error: { status: number }) {
		switch (error.status) {
			case 400:
			case 404:
				toast.danger("アカウント削除に失敗しました");
				break;
			case 500:
				toast.danger(
					"予期しないエラーが発生しました。お手数ですが再度試行してください。",
				);
		}
	}

	// ユーザー名更新処理
	const handleUpdateName = async (name: string) => {
		const { error } = await authClient.updateUser({
			name,
		});
		if (error) {
			toast.danger("ユーザー名の更新に失敗しました");
		}
	};

	// アカウント削除処理
	const handleDeleteAccount = async () => {
		const { error } = await authClient.deleteUser({
			callbackURL: env.VITE_CLIENT_URL,
		});
		if (error) {
			showToast(error);
		} else {
			toast.success(
				`${user.email}に確認メールを送信しました。メールに添付されたリンクからアカウント削除を完了してください。`,
			);
		}
	};

	// ロール変更申請処理
	const handleRoleChangeRequest = async () => {
		const result = await requestRoleChangeMutationFn();
		if ("error" in result) {
			toast.danger(result.error);
		} else {
			toast.success(result.message);
		}
	};

	// 現在のメール通知設定を取得
	const { data: emailNotificationSettings = [] } =
		useEmailNotificationSettings(initialSettings);

	// メール通知設定変更時の処理
	const { mutate: updateEmailNotificationSettings } =
		useUpdateEmailNotificationSettings();

	return (
		<div className="container mx-auto max-w-6xl px-4 py-8">
			{/* ページタイトル */}
			<div className="mb-8">
				<h1 className="text-foreground mb-2 text-3xl font-bold">
					プロフィール
				</h1>
				<p className="text-foreground-600">
					ユーザー情報の確認とアカウント設定の管理
				</p>
			</div>

			{/* 学生用：ロール変更申請セクション */}
			{user.role === "student" && (
				<div className="mb-8 space-y-4 rounded-lg bg-blue-50 p-6 dark:bg-blue-900/20">
					<h2 className="mb-2 text-xl font-semibold">
						教員用アカウントへ変更する
					</h2>
					<p className="mb-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
						あなたは「学生」としてログインしています。「教員」としてこのアプリを利用するには、管理者による承認が必要です。
						申請を送信すると、管理者が審査を行います。
					</p>
					<div className="flex justify-end">
						<DefaultButton onPress={handleRoleChangeRequest}>
							教員として申請する
						</DefaultButton>
					</div>
				</div>
			)}

			{/* タブコンテンツ */}
			<TabsForProfile
				profileTab={
					<UserProfileInfo user={user} onUpdateName={handleUpdateName} />
				}
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

			{/* 学生の場合は学科・学年登録モーダルを表示 */}
			{user.role === "student" && noData && (
				<ControlledModal
					isOpen={true}
					heading="学科・学年の登録をしましょう"
					size="cover"
					showCloseTrigger={false}
				>
					<CreateStudentDataForm />
				</ControlledModal>
			)}

			{/* 教員の場合は学科登録モーダルを表示 */}
			{user.role === "professor" && noData && (
				<ControlledModal
					isOpen={true}
					heading="学科の登録をしましょう"
					size="cover"
					showCloseTrigger={false}
				>
					<CreateProfDataForm />
				</ControlledModal>
			)}
		</div>
	);
}
