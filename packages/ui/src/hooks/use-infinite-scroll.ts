import { useEffect, useRef } from "react";

interface UseInfiniteScrollProps {
	hasNextPage: boolean;
	isFetchingNextPage: boolean;
	fetchNextPage?: () => void;
	threshold?: number;
}

// 無限スクロール用のカスタムフック
export function useInfiniteScroll({
	hasNextPage,
	isFetchingNextPage,
	fetchNextPage,
	threshold = 0.1,
}: UseInfiniteScrollProps) {
	// リストの末尾に監視要素を配置
	const sentinelRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				// 監視要素が表示されたら次のページを取得
				if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
					fetchNextPage?.();
				}
			},
			{ threshold },
		);

		if (sentinelRef.current) {
			observer.observe(sentinelRef.current);
		}

		return () => {
			// コンポーネントがアンマウントされるときに監視を解除
			if (sentinelRef.current) {
				observer.unobserve(sentinelRef.current);
			}
		};
	}, [hasNextPage, isFetchingNextPage, fetchNextPage, threshold]);

	return sentinelRef;
}
