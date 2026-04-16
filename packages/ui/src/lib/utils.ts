export { cn } from "@heroui/react";
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
