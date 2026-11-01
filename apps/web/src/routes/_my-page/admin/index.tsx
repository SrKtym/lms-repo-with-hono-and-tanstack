import { authClient } from "@lms-repo/auth/web";
import { BaseCard } from "@lms-repo/ui/components/cards/base-card";
import { DefaultSearchField } from "@lms-repo/ui/components/search-field";
import { UsersTable } from "@lms-repo/ui/components/tables/users-table";
import { toast } from "@lms-repo/ui/components/toast";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useAllUsers } from "@/hooks/admin";

const searchSchema = z.object({
	offset: z.number().optional(),
	limit: z.number().optional(),
	name: z.string().optional(),
});

export const Route = createFileRoute("/_my-page/admin/")({
	component: RouteComponent,
	validateSearch: (search) => searchSchema.parse(search),
	beforeLoad: ({ context }) => {
		const { role } = context;
		if (role !== "admin") {
			redirect({
				to: "/",
				throw: true,
			});
		}
	},
	loaderDeps: ({ search: { limit, offset, name } }) => ({
		limit,
		offset,
		name,
	}),
	loader: async ({ deps: { limit = 30, offset = 0, name } }) => {
		const { data } = await authClient.admin.listUsers({
			query: {
				limit,
				offset,
				sortBy: "name",
				filterField: "name",
				filterValue: name,
				filterOperator: "contains",
			},
		});

		const initialData = data?.users || [];
		const userCount = data?.total || 0;
		return { initialData, limit, offset, name, userCount };
	},
	head: () => ({
		meta: [
			{
				title: "管理者ダッシュボード | LMS-repo",
			},
		],
	}),
});

function RouteComponent() {
	const { initialData, limit, name = "", userCount } = Route.useLoaderData();
	const [debouncedValue, setDebouncedValue] = useState(name);
	const navigate = useNavigate();

	// クエリパラメータの更新を遅延実行する（デバウンス処理）
	useEffect(() => {
		const handler = setTimeout(() => {
			navigate({
				to: "/admin",
				search: (prev) => ({
					...prev,
					name: debouncedValue,
				}),
			});
		}, 1000);

		return () => {
			clearTimeout(handler);
		};
	}, [debouncedValue, navigate]);

	const {
		data: allUsersData,
		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
	} = useAllUsers(limit, initialData, name);

	// InfiniteDataから全ユーザーをフラット化
	const allUsers = allUsersData?.pages.flat() || [];

	// ロールの変更
	const setUserRole = async (userId: string, currentRole?: string | null) => {
		const newRole = currentRole === "student" ? "professor" : "student";
		try {
			const { data } = await authClient.admin.setRole({
				userId,
				role: newRole,
			});

			if (data) {
				toast.success(
					`${data.user.name || "未設定"} のロールを${newRole}に変更しました`,
				);
			}
		} catch {
			toast.danger("ロールの変更に失敗しました");
		}
	};

	return (
		<div className="p-3">
			<BaseCard className="p-6">
				<div className="mb-6 flex items-center justify-between">
					<h1 className="text-2xl font-bold">管理者ダッシュボード</h1>
				</div>
				<DefaultSearchField
					placeholder="ユーザー名で検索"
					value={debouncedValue}
					onChange={setDebouncedValue}
				/>
				<p>検索結果: {userCount}人</p>
				<UsersTable
					users={allUsers}
					onRoleChange={setUserRole}
					hasNextPage={hasNextPage}
					isFetchingNextPage={isFetchingNextPage}
					fetchNextPage={() => fetchNextPage()}
				/>
			</BaseCard>
		</div>
	);
}
