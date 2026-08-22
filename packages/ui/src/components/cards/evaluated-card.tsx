import type { FetchAllSubmissionsWithStudentsReturnType } from "@lms-repo/db/utils/query/submissions";
import { useInfiniteScroll } from "@lms-repo/ui/hooks/use-infinite-scroll";
import { Loader } from "../loader";
import { SubmissionsTable } from "../table";
import { BaseCard } from "./base-card";

interface EvaluatedCardProps {
	submissions: FetchAllSubmissionsWithStudentsReturnType;
	isLoading?: boolean;
	hasNextPage?: boolean;
	fetchNextPage?: () => void;
	isFetchingNextPage?: boolean;
	onViewTextSubmission?: (submissionId: string) => void;
	onDownloadFile?: (fileId: string) => void;
	onGrade?: (userId: string, assignmentId: string, score: number) => void;
}

// EvaluatedCard component
export function EvaluatedCard({
	submissions,
	isLoading = false,
	hasNextPage = false,
	fetchNextPage,
	isFetchingNextPage = false,
	onViewTextSubmission,
	onDownloadFile,
	onGrade,
}: EvaluatedCardProps) {
	const sentinelRef = useInfiniteScroll({
		hasNextPage,
		isFetchingNextPage,
		fetchNextPage,
	});

	return (
		<BaseCard className="border border-divider lg:h-full lg:max-h-[600px]">
			<div className="p-6">
				<h2 className="mb-4 font-medium text-lg">提出状況一覧</h2>
				{isLoading ? (
					<div className="py-4 text-center text-gray-500 dark:text-gray-400">
						データを取得中...
					</div>
				) : submissions.length === 0 ? (
					<div className="py-4 text-center text-gray-500 dark:text-gray-400">
						提出物はありません
					</div>
				) : (
					<SubmissionsTable
						submissions={submissions}
						onViewTextSubmission={onViewTextSubmission}
						onDownloadFile={onDownloadFile}
						onGrade={onGrade}
					>
						{hasNextPage && (
							<div ref={sentinelRef} className="py-2">
								{isFetchingNextPage && <Loader />}
							</div>
						)}
					</SubmissionsTable>
				)}
			</div>
		</BaseCard>
	);
}
