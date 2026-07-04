import * as m from "motion/react-m";
import { useEffect, useRef } from "react";
import { MenuActionButton } from "./button";

interface LongPressPopoverProps {
	onEdit: () => void;
	onDelete: () => void;
	onClose: () => void;
	position: { x: number; y: number };
}

// 長押しポップオーバー
export function LongPressPopover({
	onEdit,
	onDelete,
	onClose,
	position,
}: LongPressPopoverProps) {
	const menuRef = useRef<HTMLDivElement>(null);

	// メニュー外クリックで閉じる
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				onClose();
			}
		};

		document.addEventListener("mousedown", handleClickOutside);

		// アンマウント時にイベントリスナーを削除
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [onClose]);

	return (
		<m.div
			ref={menuRef}
			initial={{ opacity: 0, scale: 0.8, y: -10 }}
			animate={{ opacity: 1, scale: 1, y: 0 }}
			exit={{ opacity: 0, scale: 0.8, y: -10 }}
			transition={{ duration: 0.2 }}
			className="fixed z-50 rounded-lg bg-white p-2 shadow-lg dark:bg-gray-800"
			style={{
				left: `${position.x}px`,
				top: `${position.y}px`,
			}}
		>
			<div className="flex flex-col gap-1">
				<MenuActionButton
					type="edit"
					onClick={() => {
						onEdit();
						onClose();
					}}
				/>
				<MenuActionButton
					type="delete"
					onClick={() => {
						onDelete();
						onClose();
					}}
				/>
			</div>
		</m.div>
	);
}

interface UseLongPressHandlers {
	onTouchStart: (e: React.TouchEvent) => void;
	onTouchEnd: () => void;
}

interface UseLongPressReturn {
	handlers: UseLongPressHandlers;
}

// 長押しハンドラー
export function useLongPress(
	onLongPress: (position: { x: number; y: number }) => void,
	delay = 500,
): UseLongPressReturn {
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
