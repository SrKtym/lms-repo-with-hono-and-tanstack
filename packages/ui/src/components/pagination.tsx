import { Pagination } from "@heroui/react";

// 汎用ページネーションコンポーネント
export function CustomPagination() {
	return (
		<Pagination>
			<Pagination.Summary>1 to 10 of 100</Pagination.Summary>
			<Pagination.Content>
				<Pagination.Item>
					<Pagination.Previous>
						<Pagination.PreviousIcon />
						<span>前のページ</span>
					</Pagination.Previous>
				</Pagination.Item>
				<Pagination.Item>
					<Pagination.Link isActive>1</Pagination.Link>
				</Pagination.Item>
				<Pagination.Item>
					<Pagination.Ellipsis />
				</Pagination.Item>
				<Pagination.Item>
					<Pagination.Link>10</Pagination.Link>
				</Pagination.Item>
				<Pagination.Item>
					<Pagination.Next>
						<span>次のページ</span>
						<Pagination.NextIcon />
					</Pagination.Next>
				</Pagination.Item>
			</Pagination.Content>
		</Pagination>
	);
}
