import type { FetchRegisteredCoursesReturnType } from "@lms-repo/db/utils/query/courses";
import { toast } from "@lms-repo/ui/components/toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono-client";
import { queryClient } from "@/lib/query-client";
import { fetchRegisteredCoursesQueryFn } from "@/utils/query-utils";

// トースト表示
function showToast(data: { status: number; message: string }) {
	switch (data.status) {
		case 400:
		case 404:
			toast.danger("講義の登録に失敗しました", {
				description: data.message,
			});
			break;
		case 500:
			toast.danger(data.message);
	}
}

// 登録済み講義を取得するカスタムフック
export const useRegisteredCourses = (
	initialData?: FetchRegisteredCoursesReturnType,
) => {
	return useQuery({
		queryKey: ["registered-courses"],
		queryFn: fetchRegisteredCoursesQueryFn,
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
			const res = await client.api.courses[":weekdays"][":period"].$get({
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
			const res = await client.api.courses.registered.$post({
				json: { courseId },
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
		onSuccess: (data) => showToast(data),
		onError: (_err, _courseId, context) => {
			// ミューテーションが失敗した場合, ロールバック用データをコンテキストから受け取る
			if (context?.previousCourses) {
				queryClient.setQueryData(
					["registered-courses"],
					context.previousCourses,
				);
			}
		},
		onSettled: () => {
			// ミューテーションの成功時も失敗時も再フェッチする
			queryClient.invalidateQueries({ queryKey: ["registered-courses"] });
		},
	});
};

// 登録講義を確定するカスタムフック
export const useCheckCourse = () => {
	return useMutation({
		mutationFn: async () => {
			const res = await client.api.courses.registered.$patch();
			const data = await res.json();
			return data;
		},
		onMutate: async () => {
			// 古いデータの再取得をキャンセルする
			await queryClient.cancelQueries({ queryKey: ["registered-courses"] });

			// キャッシュされているデータを同期的に取得する
			const previousCourses = queryClient.getQueryData(["registered-courses"]);

			// 楽観的更新
			queryClient.setQueryData(
				["registered-courses"],
				(old: FetchRegisteredCoursesReturnType) =>
					old.map((course) => ({ ...course, isChecked: true })),
			);

			return { previousCourses };
		},
		onSuccess: (data) => showToast(data),
		onError: (_err, _courseId, context) => {
			// ミューテーションが失敗した場合, ロールバック用データをコンテキストから受け取る
			if (context?.previousCourses) {
				queryClient.setQueryData(
					["registered-courses"],
					context.previousCourses,
				);
			}
		},
		onSettled: () => {
			// ミューテーションの成功時も失敗時も再フェッチする
			queryClient.invalidateQueries({ queryKey: ["registered-courses"] });
		},
	});
};

// 講義を登録解除するカスタムフック
export const useUnregisterCourse = () => {
	return useMutation({
		mutationFn: async (courseId: string) => {
			const res = await client.api.courses.registered.$delete({
				json: { courseId },
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
		onSuccess: (data) => showToast(data),
		onError: (_err, _courseId, context) => {
			// ミューテーションが失敗した場合, ロールバック用データをコンテキストから受け取る
			if (context?.previousCourses) {
				queryClient.setQueryData(
					["registered-courses"],
					context.previousCourses,
				);
			}
		},
		onSettled: () => {
			// ミューテーションの成功時も失敗時も再フェッチする
			queryClient.invalidateQueries({ queryKey: ["registered-courses"] });
		},
	});
};
