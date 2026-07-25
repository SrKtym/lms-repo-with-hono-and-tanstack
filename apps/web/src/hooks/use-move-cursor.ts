import { useCallback } from "react";

export function useMoveCursorToElement(
	sceneContainerRef: React.RefObject<HTMLDivElement | null>,
	setCursorPosition: (position: { x: number; y: number }) => void,
) {
	return useCallback(
		(element: HTMLElement | null) => {
			const container = sceneContainerRef.current;
			if (!container || !element) return;

			// 要素の幅・高さとビューポート基準の相対位置を取得
			const containerRect = container.getBoundingClientRect();
			const elementRect = element.getBoundingClientRect();

			// カーソルの中心位置を計算
			setCursorPosition({
				x: elementRect.left - containerRect.left + elementRect.width / 2 - 18,
				y: elementRect.top - containerRect.top + elementRect.height / 2 - 18,
			});
		},
		[sceneContainerRef, setCursorPosition],
	);
}
