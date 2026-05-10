export { cn, parseColor } from "@heroui/react";
export {
	DateFormatter,
	type DateValue,
	getLocalTimeZone,
	now,
	parseDate,
	parseZonedDateTime,
	type ZonedDateTime,
} from "@internationalized/date";

// 曜日の配列
export const DAYS = ["日", "月", "火", "水", "木", "金", "土"] as const;

export function getFileColor(type: string) {
	switch (type) {
		case "pdf":
			return "danger";
		case "word":
			return "accent";
		case "excel":
			return "success";
		case "powerpoint":
			return "warning";
		case "text":
			return "default";
		default:
			return "default";
	}
}

export function formatTimestamp(date: Date): string {
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
}
