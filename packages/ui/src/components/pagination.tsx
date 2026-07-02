import { Pagination } from "@heroui/react";

interface DefaultPaginationProps {
	currentPage: number;
	totalPages: number;
	totalItems: number;
	itemsPerPage: number;
	onPageChange: (page: number) => void;
}

// 汎用ページネーションコンポーネント
export function DefaultPagination({
	currentPage,
	totalPages,
	totalItems,
	itemsPerPage,
	onPageChange,
}: DefaultPaginationProps) {
	const startItem = (currentPage - 1) * itemsPerPage + 1;
	const endItem = Math.min(currentPage * itemsPerPage, totalItems);
	const displayStartItem = Math.min(startItem, endItem);

	// ページ番号を計算する関数
	const getPageNumbers = () => {
		const pages = [];
		const maxVisiblePages = 5;

		// totalPagesがmaxVisiblePages以下なら全て表示
		if (totalPages <= maxVisiblePages) {
			Array.from({ length: totalPages }, (_, i) => i + 1).forEach((i) => {
				pages.push(i);
			});
		} else {
			// currentPageが3以下（前半）なら1,2,3,4,...,totalPages
			if (currentPage <= 3) {
				Array.from({ length: 4 }, (_, i) => i + 1).forEach((i) => {
					pages.push(i);
				});
				pages.push("ellipsis");
				pages.push(totalPages);
			}
			// currentPageがtotalPages-2の値以上（後半）なら1,...,totalPages-3,totalPages-2,totalPages-1,totalPages
			else if (currentPage >= totalPages - 2) {
				pages.push(1);
				pages.push("ellipsis");
				Array.from({ length: 4 }, (_, i) => totalPages - 3 + i).forEach((i) => {
					pages.push(i);
				});
			}
			// その他の場合は1,...,currentPage-1,currentPage,currentPage+1,...,totalPages
			else {
				pages.push(1);
				pages.push("ellipsis");
				pages.push(currentPage - 1);
				pages.push(currentPage);
				pages.push(currentPage + 1);
				pages.push("ellipsis");
				pages.push(totalPages);
			}
		}
		return pages;
	};

	return (
		<Pagination>
			<Pagination.Summary>
				{displayStartItem} to {endItem} of {totalItems}
			</Pagination.Summary>
			<Pagination.Content>
				{/* 前のページ */}
				<Pagination.Item>
					<Pagination.Previous
						isDisabled={currentPage === 1}
						onPress={() => onPageChange(currentPage - 1)}
					>
						<Pagination.PreviousIcon />
						<p>前のページ</p>
					</Pagination.Previous>
				</Pagination.Item>

				{/* ページ番号 */}
				{getPageNumbers().map((page, index) =>
					page === "ellipsis" ? (
						<Pagination.Item key={`ellipsis-${index}`}>
							<Pagination.Ellipsis />
						</Pagination.Item>
					) : (
						<Pagination.Item key={page}>
							<Pagination.Link
								isActive={page === currentPage}
								onPress={() => onPageChange(page as number)}
							>
								{page}
							</Pagination.Link>
						</Pagination.Item>
					),
				)}

				{/* 次のページ */}
				<Pagination.Item>
					<Pagination.Next
						isDisabled={currentPage === totalPages}
						onPress={() => onPageChange(currentPage + 1)}
					>
						<p>次のページ</p>
						<Pagination.NextIcon />
					</Pagination.Next>
				</Pagination.Item>
			</Pagination.Content>
		</Pagination>
	);
}
