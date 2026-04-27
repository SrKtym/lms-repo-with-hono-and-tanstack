import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { useState } from "react";
import { LazyMotionProvider } from "@lms-repo/ui/components/lazymotion-provider";

interface Notification {
	id: string;
	title: string;
	message: string;
	type: "info" | "success" | "warning" | "error" | "course";
	timestamp: Date;
	read: boolean;
	action?: {
		label: string;
		onClick: () => void;
	};
	courseId?: string;
}

interface NotificationsProps {
	notifications: Notification[];
	onMarkAsRead?: (id: string) => void;
	onDelete?: (id: string) => void;
	onMarkAllAsRead?: () => void;
	onClearAll?: () => void;
}

export function Notifications({
	notifications,
	onMarkAsRead,
	onDelete,
	onMarkAllAsRead,
	onClearAll,
}: NotificationsProps) {
	const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
	const [expandedNotifications, setExpandedNotifications] = useState<
		Set<string>
	>(new Set());

	// フィルター適用
	const filteredNotifications = notifications.filter((notification) => {
		if (filter === "unread") return !notification.read;
		if (filter === "read") return notification.read;
		return true;
	});

	// 未読数
	const unreadCount = notifications.filter((n) => !n.read).length;

	// 通知タイプのスタイルを取得
	const getNotificationStyle = (type: Notification["type"]) => {
		switch (type) {
			case "success":
				return "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300";
			case "warning":
				return "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300";
			case "error":
				return "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300";
			case "course":
				return "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300";
			default:
				return "bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-900/20 dark:border-gray-700 dark:text-gray-300";
		}
	};

	// 通知アイコンを取得
	const getNotificationIcon = (type: Notification["type"]) => {
		switch (type) {
			case "success":
				return (
					<svg
						className="h-5 w-5"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				);
			case "warning":
				return (
					<svg
						className="h-5 w-5"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
						/>
					</svg>
				);
			case "error":
				return (
					<svg
						className="h-5 w-5"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				);
			case "course":
				return (
					<svg
						className="h-5 w-5"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
						/>
					</svg>
				);
			default:
				return (
					<svg
						className="h-5 w-5"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				);
		}
	};

	// 時間文字列を取得
	const getTimeString = (date: Date) => {
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		const minutes = Math.floor(diff / (1000 * 60));
		const hours = Math.floor(diff / (1000 * 60 * 60));
		const days = Math.floor(diff / (1000 * 60 * 60 * 24));

		if (minutes < 1) return "たった今";
		if (minutes < 60) return `${minutes}分前`;
		if (hours < 24) return `${hours}時間前`;
		if (days < 7) return `${days}日前`;

		return date.toLocaleDateString("ja-JP", {
			month: "short",
			day: "numeric",
		});
	};

	// 通知の展開/折りたたみ
	const toggleExpand = (id: string) => {
		const newExpanded = new Set(expandedNotifications);
		if (newExpanded.has(id)) {
			newExpanded.delete(id);
		} else {
			newExpanded.add(id);
		}
		setExpandedNotifications(newExpanded);
	};

	// 通知を既読にする
	const handleMarkAsRead = (id: string) => {
		if (onMarkAsRead) {
			onMarkAsRead(id);
		}
	};

	// 通知を削除
	const handleDelete = (id: string) => {
		if (onDelete) {
			onDelete(id);
		}
	};

	return (
		<div className="space-y-6 p-3">
			<LazyMotionProvider>
				{/* ヘッダー */}
				<m.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
					className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
				>
					<div>
						<h2 className="font-bold text-2xl text-gray-900 dark:text-white">
							通知
						</h2>
						<p className="mt-1 text-gray-600 text-sm dark:text-gray-400">
							{unreadCount > 0 && `${unreadCount}件の未読通知`}
						</p>
					</div>
					<div className="flex items-center space-x-2">
						{unreadCount > 0 && onMarkAllAsRead && (
							<m.button
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								onClick={onMarkAllAsRead}
								className="rounded-lg bg-blue-500 px-3 py-2 font-medium text-sm text-white transition-colors hover:bg-blue-600"
							>
								すべて既読
							</m.button>
						)}
						{notifications.length > 0 && onClearAll && (
							<m.button
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								onClick={onClearAll}
								className="rounded-lg bg-red-500 px-3 py-2 font-medium text-sm text-white transition-colors hover:bg-red-600"
							>
								すべて削除
							</m.button>
						)}
					</div>
				</m.div>

				{/* フィルター */}
				<m.div
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.1 }}
					className="flex items-center space-x-2"
				>
					{["all", "unread", "read"].map((filterType) => (
						<m.button
							key={filterType}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={() => setFilter(filterType as typeof filter)}
							className={`rounded-lg px-4 py-2 font-medium text-sm transition-colors ${
								filter === filterType
									? "bg-blue-500 text-white"
									: "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
							}`}
						>
							{filterType === "all" && "すべて"}
							{filterType === "unread" && "未読"}
							{filterType === "read" && "既読"}
						</m.button>
					))}
				</m.div>

				{/* 通知リスト */}
				<div className="space-y-3">
					<AnimatePresence mode="popLayout">
						{filteredNotifications.length > 0 ? (
							filteredNotifications.map((notification, index) => (
								<m.div
									key={notification.id}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -20 }}
									transition={{ duration: 0.3, delay: index * 0.05 }}
									className={`rounded-lg border p-4 transition-all ${
										notification.read
											? "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
											: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20"
									}`}
									onClick={() => {
										if (!notification.read) {
											handleMarkAsRead(notification.id);
										}
										toggleExpand(notification.id);
									}}
								>
									<div className="flex items-start justify-between">
										<div className="flex items-start space-x-3">
											<div
												className={`rounded-full p-2 ${getNotificationStyle(notification.type)}`}
											>
												{getNotificationIcon(notification.type)}
											</div>
											<div className="flex-1">
												<div className="flex items-center space-x-2">
													<h3 className="font-semibold text-gray-900 dark:text-white">
														{notification.title}
													</h3>
													{!notification.read && (
														<span className="inline-flex h-2 w-2 rounded-full bg-blue-500" />
													)}
												</div>
												<p className="mt-1 text-gray-600 text-sm dark:text-gray-400">
													{notification.message}
												</p>
												<p className="mt-2 text-gray-500 text-xs dark:text-gray-500">
													{getTimeString(notification.timestamp)}
												</p>
												{notification.action &&
													expandedNotifications.has(notification.id) && (
														<m.div
															initial={{ opacity: 0, height: 0 }}
															animate={{ opacity: 1, height: "auto" }}
															exit={{ opacity: 0, height: 0 }}
															transition={{ duration: 0.2 }}
															className="mt-3"
														>
															<m.button
																whileHover={{ scale: 1.05 }}
																whileTap={{ scale: 0.95 }}
																onClick={(e) => {
																	e.stopPropagation();
																	notification.action?.onClick();
																}}
																className="rounded-lg bg-blue-500 px-3 py-1 font-medium text-sm text-white transition-colors hover:bg-blue-600"
															>
																{notification.action.label}
															</m.button>
														</m.div>
													)}
											</div>
										</div>
										<div className="flex items-center space-x-2">
											{!notification.read && (
												<m.button
													whileHover={{ scale: 1.1 }}
													whileTap={{ scale: 0.9 }}
													onClick={(e) => {
														e.stopPropagation();
														handleMarkAsRead(notification.id);
													}}
													className="rounded-full p-1 text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400"
												>
													<svg
														className="h-4 w-4"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M5 13l4 4L19 7"
														/>
													</svg>
												</m.button>
											)}
											<m.button
												whileHover={{ scale: 1.1 }}
												whileTap={{ scale: 0.9 }}
												onClick={(e) => {
													e.stopPropagation();
													handleDelete(notification.id);
												}}
												className="rounded-full p-1 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
											>
												<svg
													className="h-4 w-4"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M6 18L18 6M6 6l12 12"
													/>
												</svg>
											</m.button>
										</div>
									</div>
								</m.div>
							))
						) : (
							<m.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ duration: 0.3 }}
								className="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800"
							>
								<div className="space-y-4">
									<div className="mx-auto h-12 w-12 rounded-full bg-gray-100 p-3 dark:bg-gray-700">
										<svg
											className="h-6 w-6 text-gray-400 dark:text-gray-500"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M15 17h5l-5 5v-5zM4 19h8M4 15h8M4 11h16M4 7h16"
											/>
										</svg>
									</div>
									<div>
										<h3 className="font-semibold text-gray-900 dark:text-white">
											{filter === "unread"
												? "未読通知がありません"
												: filter === "read"
													? "既読通知がありません"
													: "通知がありません"}
										</h3>
										<p className="mt-1 text-gray-600 text-sm dark:text-gray-400">
											{filter === "unread"
												? "新しい通知はありません"
												: filter === "read"
													? "既読の通知はありません"
													: "新しい通知はまだありません"}
										</p>
									</div>
								</div>
							</m.div>
						)}
					</AnimatePresence>
				</div>
			</LazyMotionProvider>
		</div>
	);
}
