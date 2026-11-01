import type { UserDataTypeWithId } from "@lms-repo/db/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { QUERY_CONFIG } from "@/lib/query-client";
import { fetchAllUsersQueryFn } from "@/utils/query/admin";

// すべてのユーザーを取得するカスタムフック
export const useAllUsers = (
	limit: number,
	initialData?: UserDataTypeWithId[],
	searchQuery?: string,
) => {
	return useInfiniteQuery({
		queryKey: ["all-users", limit, searchQuery],
		queryFn: async ({ pageParam }) => {
			return fetchAllUsersQueryFn(limit, pageParam * limit, searchQuery);
		},
		enabled: true,
		initialPageParam: 0,
		initialData: initialData
			? {
					pages: [initialData],
					pageParams: [0],
				}
			: undefined,
		...QUERY_CONFIG.USER_DATA,
		getNextPageParam: (lastPage, allPages) => {
			if (lastPage.length < limit) {
				return;
			}
			return allPages.length;
		},
	});
};
