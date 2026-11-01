import { EmptyState, Table } from "@heroui/react";
import type { UserDataTypeWithId } from "@lms-repo/db/types";
import { useInfiniteScroll } from "@lms-repo/ui/hooks/use-infinite-scroll";
import { DefaultButton } from "../button";
import { DefaultChip } from "../chip";
import { Loader } from "../loader";

interface UsersTableProps {
	users: UserDataTypeWithId[];
	onRoleChange: (userId: string, currentRole?: string | null) => void;
	hasNextPage?: boolean;
	isFetchingNextPage?: boolean;
	fetchNextPage?: () => void;
}

// ユーザー一覧テーブル
export function UsersTable({
	users,
	onRoleChange,
	hasNextPage = false,
	isFetchingNextPage = false,
	fetchNextPage,
}: UsersTableProps) {
	const sentinelRef = useInfiniteScroll({
		hasNextPage,
		isFetchingNextPage,
		fetchNextPage,
	});
	const columns = [
		{
			id: "userName",
			name: "ユーザー名",
		},
		{
			id: "email",
			name: "メールアドレス",
		},
		{
			id: "role",
			name: "ロール",
		},
		{
			id: "action",
			name: "操作",
		},
	] as const;

	return (
		<Table variant="secondary">
			<Table.ScrollContainer className="h-[500px] overflow-y-auto">
				<Table.ResizableContainer>
					<Table.Content aria-label="Users">
						<Table.Header columns={columns}>
							{(column) => (
								<Table.Column
									key={column.id}
									defaultWidth="1fr"
									minWidth={column.id === "email" ? 180 : 120}
									isRowHeader={column.id === "userName"}
								>
									{column.name}
									<Table.ColumnResizer />
								</Table.Column>
							)}
						</Table.Header>
						<Table.Body
							items={users}
							renderEmptyState={() => (
								<EmptyState
									title="ユーザーが見つかりません"
									className="flex h-full w-full flex-col items-center justify-center text-center"
								>
									<p>ユーザーが見つかりませんでした。</p>
								</EmptyState>
							)}
						>
							{(user) => (
								<Table.Row key={user.id}>
									<Table.Cell className="break-words whitespace-normal">
										{user.name || "未設定"}
									</Table.Cell>
									<Table.Cell className="break-words whitespace-normal">
										{user.email}
									</Table.Cell>
									<Table.Cell>
										{user.role && (
											<DefaultChip
												color={
													user.role === "admin"
														? "danger"
														: user.role === "professor"
															? "warning"
															: "success"
												}
											>
												{user.role}
											</DefaultChip>
										)}
									</Table.Cell>
									<Table.Cell>
										{user.role && user.role !== "admin" && (
											<DefaultButton
												onPress={() => onRoleChange(user.id, user.role)}
												className="text-sm"
											>
												{user.role === "student" ? "教員に昇格" : "学生に降格"}
											</DefaultButton>
										)}
									</Table.Cell>
								</Table.Row>
							)}
						</Table.Body>
					</Table.Content>
					{hasNextPage && (
						<div ref={sentinelRef} className="py-2">
							{isFetchingNextPage && <Loader />}
						</div>
					)}
				</Table.ResizableContainer>
			</Table.ScrollContainer>
		</Table>
	);
}
