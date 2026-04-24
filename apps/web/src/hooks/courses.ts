import type { FetchRegisteredCoursesReturnType } from "@lms-repo/db/utils/query/courses";
import { useMutation, useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono-client";
import { queryClient } from "@/lib/query-client";

export const useRegisteredCourses = (
	initialData?: FetchRegisteredCoursesReturnType,
) => {
	return useQuery({
		queryKey: ["registered-courses"],
		queryFn: async () => {
			const res = await client.api.courses.search.registered.$get();
			const data = await res.json();
			if ("message" in data) {
				return [];
			}
			return data;
		},
		initialData,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes (garbage collection)
		refetchOnWindowFocus: false,
		refetchOnReconnect: true,
		retry: 3,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
	});
};

export const useSearchCourses = (weekdays?: number, period?: number) => {
	return useQuery({
		queryKey: ["search-courses", weekdays, period],
		queryFn: async () => {
			if (!weekdays || !period) {
				return [];
			}
			const res = await client.api.courses.search[":weekdays"][":period"].$get({
				param: {
					weekdays: weekdays.toString(),
					period: period.toString(),
				},
			});
			const data = await res.json();
			return data;
		},
		enabled: !!weekdays && !!period,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
};

export const useRegisterCourse = (
	searchCourses?: FetchRegisteredCoursesReturnType,
) => {
	return useMutation({
		mutationFn: async (courseId: string) => {
			const res = await client.api.courses.register.single.$post({
				json: courseId,
			});
			const data = await res.json();
			return data;
		},
		onMutate: async (courseId) => {
			// Cancel any outgoing refetches
			await queryClient.cancelQueries({ queryKey: ["registered-courses"] });

			// Snapshot the previous value
			const previousCourses = queryClient.getQueryData(["registered-courses"]);

			// Optimistically update to the new value
			const courseToRegister = searchCourses?.find(
				(course) => course.id === courseId,
			);
			if (courseToRegister) {
				queryClient.setQueryData(
					["registered-courses"],
					(old: FetchRegisteredCoursesReturnType) => [...old, courseToRegister],
				);
			}

			return { previousCourses };
		},
		onError: (_err, _courseId, context) => {
			// If the mutation fails, use the context returned from onMutate to roll back
			if (context?.previousCourses) {
				queryClient.setQueryData(
					["registered-courses"],
					context.previousCourses,
				);
			}
		},
		onSettled: () => {
			// Always refetch after error or success
			queryClient.invalidateQueries({ queryKey: ["registered-courses"] });
		},
	});
};

export const useUnregisterCourse = () => {
	return useMutation({
		mutationFn: async (courseId: string) => {
			const res = await client.api.courses.unregister.$post({
				json: courseId,
			});
			const data = await res.json();
			return data;
		},
		onMutate: async (courseId) => {
			// Cancel any outgoing refetches
			await queryClient.cancelQueries({ queryKey: ["registered-courses"] });

			// Snapshot the previous value
			const previousCourses = queryClient.getQueryData(["registered-courses"]);

			// Optimistically update to the new value
			queryClient.setQueryData(
				["registered-courses"],
				(old: FetchRegisteredCoursesReturnType) =>
					old.filter((course) => course.id !== courseId),
			);

			return { previousCourses };
		},
		onError: (_err, _courseId, context) => {
			// If the mutation fails, use the context returned from onMutate to roll back
			if (context?.previousCourses) {
				queryClient.setQueryData(
					["registered-courses"],
					context.previousCourses,
				);
			}
		},
		onSettled: () => {
			// Always refetch after error or success
			queryClient.invalidateQueries({ queryKey: ["registered-courses"] });
		},
	});
};
