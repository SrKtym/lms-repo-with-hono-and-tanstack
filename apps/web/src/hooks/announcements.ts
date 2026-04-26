import { useQuery } from "@tanstack/react-query";
import { fetchAnnouncementsQueryFn } from "@/utils/query-utils";

export const useAnnouncementsRelatedCourses = () => {
	return useQuery({
		queryKey: ["announcements-related-courses"],
		queryFn: fetchAnnouncementsQueryFn,
		staleTime: 5 * 60 * 1000,
	});
};
