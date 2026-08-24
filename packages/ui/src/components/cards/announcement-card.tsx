import type { FetchAnnouncementsFromUserCoursesReturnType } from "@lms-repo/db/utils/query/announcements";
import { useToggleExpand } from "@lms-repo/ui/hooks/use-toggle-expand";
import { DATE_FORMAT_CONFIG } from "@lms-repo/ui/lib/utils";
import { FileQuestion } from "../../assets/icons/file-question";
import { FileText } from "../../assets/icons/file-text";
import { Info } from "../../assets/icons/info";
import { BaseCard } from "../cards/base-card";
import { DefaultChip } from "../chip";

// AnnouncementCard component
export function AnnouncementCard({
	announcement,
}: {
	announcement: FetchAnnouncementsFromUserCoursesReturnType[number];
}) {
	function getFileIcon(type: string) {
		switch (type) {
			case "資料":
				return <FileText />;
			case "アンケート":
				return <FileQuestion />;
			default:
				return <Info />;
		}
	}

	function getChipColor(type: string) {
		switch (type) {
			case "資料":
				return "accent";
			case "アンケート":
				return "success";
			default:
				return "default";
		}
	}

	const { expandedId, toggleExpand } = useToggleExpand();

	return (
		<BaseCard
			className="cursor-pointer border border-gray-200 dark:border-gray-700"
			onClick={(e) => {
				toggleExpand(e, announcement.id);
			}}
		>
			<div className="flex gap-3">
				<div className="mt-1">
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
						{announcement.type && (
							<div className="text-gray-600 dark:text-gray-400">
								{getFileIcon(announcement.type)}
							</div>
						)}
					</div>
				</div>
				<div className="flex-1">
					<div className="flex items-start justify-between">
						<div className="flex-1">
							<h3
								className={`font-medium text-gray-900 dark:text-gray-100 ${expandedId === announcement.id ? "line-clamp-none" : "line-clamp-1"}`}
							>
								{announcement.title}
							</h3>
							<p className="text-gray-500 text-sm dark:text-gray-400">
								{announcement.createdAt
									? announcement.createdAt.toLocaleDateString(
											"default",
											DATE_FORMAT_CONFIG.DEFAULT,
										)
									: "処理中…"}
							</p>
						</div>
						<DefaultChip size="sm" color={getChipColor(announcement.type)}>
							{announcement.type}
						</DefaultChip>
					</div>

					<div className="mt-3">
						<p
							className={`text-gray-700 leading-relaxed dark:text-gray-300 ${expandedId === announcement.id ? "line-clamp-none" : "line-clamp-1"}`}
						>
							{announcement.description}
						</p>
					</div>
				</div>
			</div>
		</BaseCard>
	);
}
