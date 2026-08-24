import type { Notifications } from "@lms-repo/db/types";
import type { FetchNotificationsReturnType } from "@lms-repo/db/utils/query/notifications";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import {
	deleteNotificationMutationFn,
	markNotificationAsReadMutationFn,
} from "@/utils/mutation/notifications";
import {
	fetchNotificationsCountQueryFn,
	fetchNotificationsQueryFn,
} from "@/utils/query/notifications";

// 通知一覧を取得するカスタムフック（無限スクロール・ポーリング対応）
export const useNotifications = (
	limit: number,
	initialData?: FetchNotificationsReturnType,
) => {
	return useInfiniteQuery({
		queryKey: ["notifications", limit],
		queryFn: async ({ pageParam }) => {
			return fetchNotificationsQueryFn(limit, pageParam * limit);
		},
		enabled: true,
		initialPageParam: 0,
		initialData: initialData
			? {
					pages: [initialData],
					pageParams: [0],
				}
			: undefined,
		getNextPageParam: (lastPage, allPages) => {
			if (lastPage.length < 10) {
				return; // データが10件未満の場合はこれ以上データがない
			}
			return allPages.length; // 次のページ番号
		},
		refetchInterval: 10000, // ポーリング間隔10秒を設定
		refetchIntervalInBackground: true, // バックグラウンドでもポーリング
		retry: 3, // 失敗時のリトライ回数
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // 指数バックオフ
	});
};

// 通知一覧を取得するカスタムフック（従来のページネーション対応）
export const useNotificationsPaginated = (
	page: number,
	limit: number,
	initialData?: FetchNotificationsReturnType,
) => {
	const offset = (page - 1) * limit;
	return useQuery({
		queryKey: ["notifications", page, limit],
		queryFn: () => fetchNotificationsQueryFn(limit, offset),
		initialData,
		staleTime: 0, // ページ変更時に即時再取得するため0に設定
		gcTime: 10 * 60 * 1000, // 10 minutes
		refetchInterval: 10000, // ポーリング間隔10秒を設定
		refetchIntervalInBackground: true, // バックグラウンドでもポーリング
		retry: 3, // 失敗時のリトライ回数
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // 指数バックオフ
	});
};

// 通知総数を取得するカスタムフック
export const useNotificationsCount = (filter?: "all" | "unread" | "read") => {
	return useQuery({
		queryKey: ["notifications", "count", filter],
		queryFn: () => fetchNotificationsCountQueryFn(filter),
		refetchInterval: 10000, // ポーリング間隔10秒を設定
		refetchIntervalInBackground: true, // バックグラウンドでもポーリング
		retry: 3, // 失敗時のリトライ回数
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // 指数バックオフ
	});
};

// 通知を既読にするカスタムフック
export const useMarkNotificationAsRead = () => {
	return useMutation({
		mutationFn: markNotificationAsReadMutationFn,
		onMutate: async (notificationId) => {
			// 古いデータの再取得をキャンセルする
			await queryClient.cancelQueries({ queryKey: ["notifications"] });

			// 更新前のデータを保存し、エラー発生時のロールバック用に使用
			const previousNotifications = queryClient.getQueryData(["notifications"]);

			// 楽観的更新
			queryClient.setQueryData(["notifications"], (old: Notifications[]) =>
				old.filter((notification) => notification.id !== notificationId),
			);

			return { previousNotifications };
		},
		onError: (_err, _notificationId, context) => {
			// ミューテーションが失敗した場合, ロールバック用データをコンテキストから受け取る
			if (context?.previousNotifications) {
				queryClient.setQueryData(
					["notifications"],
					context.previousNotifications,
				);
			}
		},
		onSettled: () => {
			// ミューテーションの成功時も失敗時も再フェッチする
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
		},
	});
};

// 通知を削除するカスタムフック
export const useDeleteNotification = () => {
	return useMutation({
		mutationFn: deleteNotificationMutationFn,
		onMutate: async (notificationId) => {
			// 古いデータの再取得をキャンセルする
			await queryClient.cancelQueries({ queryKey: ["notifications"] });

			// 更新前のデータを保存し、エラー発生時のロールバック用に使用
			const previousNotifications = queryClient.getQueryData(["notifications"]);

			// 楽観的更新
			queryClient.setQueryData(["notifications"], (old: Notifications[]) =>
				old.filter((notification) => notification.id !== notificationId),
			);

			return { previousNotifications };
		},
		onError: (_err, _notificationId, context) => {
			// ミューテーションが失敗した場合, ロールバック用データをコンテキストから受け取る
			if (context?.previousNotifications) {
				queryClient.setQueryData(
					["notifications"],
					context.previousNotifications,
				);
			}
		},
		onSettled: () => {
			// ミューテーションの成功時も失敗時も再フェッチする
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
		},
	});
};
