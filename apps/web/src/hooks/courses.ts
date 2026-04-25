import type { FetchRegisteredCoursesReturnType } from "@lms-repo/db/utils/query/courses";
import { useMutation, useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono-client";
import { queryClient } from "@/lib/query-client";

// 登録済み講義を取得するカスタムフック
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
		staleTime: 5 * 60 * 1000,
		initialData,
	});
};

// 曜日と時限から講義を取得するカスタムフック
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

// 講義を登録するカスタムフック
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
			// 古いデータの再取得をキャンセルする
			await queryClient.cancelQueries({ queryKey: ["registered-courses"] });

			// キャッシュされているデータを同期的に取得する
			const previousCourses = queryClient.getQueryData(["registered-courses"]);

			const courseToRegister = searchCourses?.find(
				(course) => course.id === courseId,
			);
			if (courseToRegister) {
				// 楽観的更新
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
			// 古いデータの再取得をキャンセルする
			await queryClient.cancelQueries({ queryKey: ["registered-courses"] });

			// キャッシュされているデータを同期的に取得する
			const previousCourses = queryClient.getQueryData(["registered-courses"]);

			// 楽観的更新
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
