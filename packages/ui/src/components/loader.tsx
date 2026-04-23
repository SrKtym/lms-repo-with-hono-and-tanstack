import { Spinner } from "@heroui/react";

// 汎用ローダーコンポーネント
export function Loader({ className }: { className?: string }) {
	return (
		<div
			className={`flex min-h-screen items-center justify-center gap-2 ${className || ""}`}
		>
			<Spinner />
			<p>読み込み中...</p>
		</div>
	);
}
