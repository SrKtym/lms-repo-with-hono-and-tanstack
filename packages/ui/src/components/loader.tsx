import { Spinner } from "@heroui/react";

// 汎用ローダーコンポーネント
export function Loader({
	className,
	text = "読み込み中...",
}: {
	className?: string;
	text?: string;
}) {
	return (
		<div className={`flex items-center justify-center gap-2 ${className}`}>
			<Spinner />
			<p>{text}</p>
		</div>
	);
}
