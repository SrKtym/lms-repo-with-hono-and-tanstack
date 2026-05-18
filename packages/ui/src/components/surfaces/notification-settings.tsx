import { Surface } from "@heroui/react";
import { useState } from "react";

interface NotificationSettings {
	emailNotifications: {
		assignments: boolean;
		announcements: boolean;
		grades: boolean;
		deadlines: boolean;
	};
	pushNotifications: {
		assignments: boolean;
		announcements: boolean;
		grades: boolean;
		deadlines: boolean;
	};
	digestFrequency: "daily" | "weekly" | "never";
}

interface NotificationSettingsProps {
	settings?: Partial<NotificationSettings>;
	onSettingsChange?: (settings: NotificationSettings) => void;
}

const defaultSettings: NotificationSettings = {
	emailNotifications: {
		assignments: true,
		announcements: true,
		grades: true,
		deadlines: true,
	},
	pushNotifications: {
		assignments: false,
		announcements: true,
		grades: true,
		deadlines: true,
	},
	digestFrequency: "daily",
};

export function NotificationSettings({
	settings = {},
	onSettingsChange,
}: NotificationSettingsProps) {
	const [currentSettings, setCurrentSettings] = useState<NotificationSettings>({
		...defaultSettings,
		...settings,
	});

	const updateSettings = (newSettings: Partial<NotificationSettings>) => {
		const updated = { ...currentSettings, ...newSettings };
		setCurrentSettings(updated);
		onSettingsChange?.(updated);
	};

	const toggleEmailNotification = (
		type: keyof typeof currentSettings.emailNotifications,
	) => {
		updateSettings({
			emailNotifications: {
				...currentSettings.emailNotifications,
				[type]: !currentSettings.emailNotifications[type],
			},
		});
	};

	const togglePushNotification = (
		type: keyof typeof currentSettings.pushNotifications,
	) => {
		updateSettings({
			pushNotifications: {
				...currentSettings.pushNotifications,
				[type]: !currentSettings.pushNotifications[type],
			},
		});
	};

	return (
		<Surface className="mx-auto w-full max-w-2xl rounded-2xl p-6 shadow-surface">
			<h2 className="mb-6 font-bold text-foreground text-xl">通知設定</h2>

			<div className="space-y-6">
				{/* メール通知 */}
				<div>
					<h3 className="mb-4 font-medium text-foreground">メール通知</h3>
					<div className="space-y-3">
						{Object.entries(currentSettings.emailNotifications).map(
							([key, value]) => (
								<div
									key={key}
									className="flex items-center justify-between rounded-lg border border-divider p-3"
								>
									<span className="text-sm">
										{key === "assignments" && "課題の投稿・更新"}
										{key === "announcements" && "お知らせ"}
										{key === "grades" && "成績・評価"}
										{key === "deadlines" && "締切リマインダー"}
									</span>
									<label className="relative inline-flex cursor-pointer items-center">
										<input
											type="checkbox"
											checked={value}
											onChange={() =>
												toggleEmailNotification(
													key as keyof typeof currentSettings.emailNotifications,
												)
											}
											className="peer sr-only"
										/>
										<div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300" />
									</label>
								</div>
							),
						)}
					</div>
				</div>

				{/* 通知ダイジェスト
				<div>
					<h3 className="mb-4 font-medium text-foreground">通知ダイジェスト</h3>
					<div className="rounded-lg border border-divider p-3">
						<label className="mb-2 block font-medium text-foreground text-sm">
							まとめて受け取る頻度
						</label>
						<select
							value={currentSettings.digestFrequency}
							onChange={(e) =>
								updateSettings({
									digestFrequency: e.target.value as
										| "daily"
										| "weekly"
										| "never",
								})
							}
							className="w-full rounded-lg border border-divider bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="daily">毎日</option>
							<option value="weekly">毎週</option>
							<option value="never">受け取らない</option>
						</select>
						<p className="mt-2 text-foreground-600 text-xs">
							個別通知を無効にした場合、この設定で指定された頻度でまとめて通知を受け取ります
						</p>
					</div>
				</div> */}
			</div>
		</Surface>
	);
}
