import { authClient } from "@lms-repo/auth/web";

// すべてのユーザーを取得するqueryFn
export const fetchAllUsersQueryFn = async (
	limit?: number,
	offset?: number,
	name?: string,
) => {
	if (!limit || !offset) {
		return [];
	}
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
	return data?.users || [];
};
