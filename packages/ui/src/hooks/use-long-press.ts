import { useRef } from "react";

// 長押しハンドラー
export function useLongPress(
	onLongPress: (position: { x: number; y: number }) => void,
	delay = 500,
) {
	const timerRef = useRef<NodeJS.Timeout | null>(null);
	const startPositionRef = useRef<{ x: number; y: number } | null>(null);

	// 0.5秒間タッチを検出
	const start = (clientX: number, clientY: number) => {
		startPositionRef.current = { x: clientX, y: clientY };
		timerRef.current = setTimeout(() => {
			onLongPress({ x: clientX, y: clientY });
		}, delay);
	};

	// タイマーをクリア
	const clear = () => {
		if (timerRef.current) {
			clearTimeout(timerRef.current);
			timerRef.current = null;
		}
	};

	// タッチ開始時に長押しを検出
	const onTouchStart = (e: React.TouchEvent) => {
		const touch = e.touches[0];
		if (touch) {
			start(touch.clientX, touch.clientY);
		}
	};

	// タッチ終了時にタイマーをクリア
	const onTouchEnd = () => {
		clear();
	};

	return {
		handlers: {
			onTouchStart,
			onTouchEnd,
		},
	};
}
