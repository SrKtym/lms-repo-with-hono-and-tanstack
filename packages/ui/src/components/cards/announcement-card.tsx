import { FileQuestion } from "../../assets/icons/file-question";
import { FileText } from "../../assets/icons/file-text";
import { Info } from "../../assets/icons/info";
import { BaseCard } from "../cards/base-card";
import { DefaultChip } from "../chip";

// Type definitions
interface AnnouncementData {
	id: number;
	title: string;
	content: string;
	type: string;
	createdAt: Date;
}

interface AnnouncementCardProps {
	data: AnnouncementData;
}

// AnnouncementCard component
export function AnnouncementCard({ data }: AnnouncementCardProps) {
	function getFileIcon(type: string) {
		switch (type) {
			case "Information":
				return <FileText />;
			case "Survey":
				return <FileQuestion />;
			default:
				return <Info />;
		}
	}

	function getChipColor(
		type: string,
	): "default" | "success" | "warning" | "danger" | "accent" {
		switch (type) {
			case "Information":
				return "default";
			case "Assignment":
				return "warning";
			case "Survey":
				return "accent";
			default:
				return "default";
		}
	}

	const dateOptions: Intl.DateTimeFormatOptions = {
		year: "numeric",
		month: "short",
		day: "numeric",
	};

	return (
		<BaseCard
			key={data.id}
			className="cursor-pointer border border-gray-200 dark:border-gray-700"
		>
			<div className="flex gap-3">
				<div className="mt-1">
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
						{data.type && (
							<div className="text-gray-600 dark:text-gray-400">
								{getFileIcon(data.type)}
							</div>
						)}
					</div>
				</div>
				<div className="flex-1">
					<div className="flex items-start justify-between">
						<div className="flex-1">
							<h3 className="font-medium text-gray-900 dark:text-gray-100">
								{data.title}
							</h3>
							<p className="text-gray-500 text-sm dark:text-gray-400">
								{data.createdAt.toLocaleDateString("default", dateOptions)}
							</p>
						</div>
						<DefaultChip size="sm" color={getChipColor(data.type)}>
							{data.type}
						</DefaultChip>
					</div>

					<div className="mt-3">
						<p className="text-gray-700 leading-relaxed dark:text-gray-300">
							{data.content}
						</p>
					</div>
				</div>
			</div>
		</BaseCard>
	);
}
