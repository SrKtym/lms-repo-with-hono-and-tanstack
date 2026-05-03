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

export function getFileColor(
	type: string,
): "default" | "success" | "warning" | "danger" | "accent" {
	switch (type) {
		case "pdf":
			return "danger";
		case "doc":
			return "default";
		case "xls":
			return "success";
		case "Project":
			return "accent";
		case "Quiz":
			return "warning";
		case "Assignment":
			return "success";
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
