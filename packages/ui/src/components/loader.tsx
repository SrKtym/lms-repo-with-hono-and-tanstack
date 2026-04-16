import { Spinner } from "@heroui/react";

// 汎用ローダーコンポーネント
export function Loader() {
	return (
		<div className="flex min-h-screen items-center justify-center gap-2">
			<Spinner className="spinner--accent" />
			<p>読み込み中...</p>
		</div>
	);
}
