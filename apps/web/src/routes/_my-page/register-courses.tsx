import type {
	FetchCoursesReturnType,
	FetchRegisteredCoursesReturnType,
} from "@lms-repo/db/utils/query/courses";
import { Check } from "@lms-repo/ui/assets/icons/check";
import { Search } from "@lms-repo/ui/assets/icons/search";
import { DefaultButton } from "@lms-repo/ui/components/button";
import { TimeTableCard } from "@lms-repo/ui/components/cards/time-table-card";
import { CourseDrawer } from "@lms-repo/ui/components/drawer";
import { ConfirmationModal } from "@lms-repo/ui/components/modals/confirmation-modal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import * as m from "motion/react-m";
import { useState } from "react";
import { z } from "zod";
import { LazyMotionProvider } from "@lms-repo/ui/components/lazymotion-provider";
import { client } from "@/lib/hono-client";
import { queryClient } from "@/main";

interface TableState {
	selectedCourse: FetchRegisteredCoursesReturnType[number] | null;
	isModalOpen: boolean;
	showCourseList: boolean;
	selectedCell: { day: string; period: string } | null;
	showCourseSelection: boolean;
	isEditMode: boolean;
	editFormData: FetchRegisteredCoursesReturnType[number] | null;
}

export const Route = createFileRoute("/_my-page/register-courses")({
	component: RouteComponent,
	validateSearch: z.custom<Partial<Omit<FetchCoursesReturnType[number], "id">>>(),
	loader: async () => {
		const res = await client.api.courses.search.registered.$get();
		const data = await res.json();
		let result;
		if ("message" in data) {
			result = { courses: [] };
		} else {
			result = { courses: data };
		}
		
		// Prefetch data into TanStack Query cache
		queryClient.setQueryData(["registered-courses"], result);
		return result;
	},
});

function RouteComponent() {
	const params = Route.useSearch();
	const registeredCoursesData = Route.useLoaderData();
	const navigate = useNavigate();
	const [state] = useState<TableState>({
		selectedCourse: null,
		isModalOpen: false,
		showCourseList: false,
		selectedCell: null,
		showCourseSelection: false,
		isEditMode: false,
		editFormData: null,
	});

	const { data: registeredCourses } = useQuery({
		queryKey: ["registered-courses"],
		queryFn: async () => {
			const res = await client.api.courses.search.registered.$get();
			const data = await res.json();
			if ("message" in data) {
				return { courses: [] };
			}
			return { courses: data };
		},
		initialData: registeredCoursesData,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	const { data: searchCourses, isLoading } = useQuery({
		queryKey: ["search-courses", params.weekdays, params.period],
		queryFn: async () => {
			if (!params.weekdays || !params.period) {
				return [];
			}
			const res = await client.api.courses.search[":weekdays"][
				":period"
			].$get({
				param: {
					weekdays: params.weekdays.toString(),
					period: params.period.toString(),
				},
			});
			const data = await res.json();
			return data;
		},
		enabled: !!params.weekdays && !!params.period,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	const courses = registeredCourses?.courses || [];

	// search paramsのセット
	const handleCellClick = (day: number, period: number) => {
		navigate({
			to: "/register-courses",
			search: { weekdays: day, period },
		});
	};

	// 講義の登録
	const handleRegisterCourses = useMutation({
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
			const courseToRegister = searchCourses?.find((course) => course.id === courseId);
			if (courseToRegister) {
				queryClient.setQueryData(["registered-courses"], (old: any) => ({
					courses: [...(old?.courses || []), courseToRegister]
				}));
			}
			
			return { previousCourses };
		},
		onError: (err, courseId, context) => {
			// If the mutation fails, use the context returned from onMutate to roll back
			if (context?.previousCourses) {
				queryClient.setQueryData(["registered-courses"], context.previousCourses);
			}
		},
		onSettled: () => {
			// Always refetch after error or success
			queryClient.invalidateQueries({ queryKey: ["registered-courses"] });
		},
	});

	// 講義の削除
	const handleDeleteCourse = useMutation({
		mutationFn: async (courseId: string) => {
			const res = await client.api.courses.unregister.$post({
				json: { courseId },
			});
			const data = await res.json();
			return data;
		},
		onMutate: async (courseId) => {
			// Cancel any outgoing refetches
			await queryClient.cancelQueries({ queryKey: ["registered-courses"] });
			
			// Snapshot the previous value
			const previousCourses = queryClient.getQueryData(["registered-courses"]);
			
			// Optimistically remove the course from the list
			queryClient.setQueryData(["registered-courses"], (old: any) => ({
				courses: old?.courses?.filter((course: any) => course.id !== courseId) || []
			}));
			
			return { previousCourses };
		},
		onError: (err, courseId, context) => {
			// If the mutation fails, use the context returned from onMutate to roll back
			if (context?.previousCourses) {
				queryClient.setQueryData(["registered-courses"], context.previousCourses);
			}
		},
		onSettled: () => {
			// Always refetch after error or success
			queryClient.invalidateQueries({ queryKey: ["registered-courses"] });
		},
	});

	return (
		<div className="space-y-6 p-3">
			<LazyMotionProvider>
				<m.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="flex items-center justify-between"
				>
					<h2 className="font-bold text-xl">履修登録</h2>
					<CourseDrawer
						triggerButton={
							<DefaultButton size="sm" className="flex items-center gap-2">
								<Search />
								<p className="max-sm:hidden">講義を検索する</p>
							</DefaultButton>
						}
					/>
				</m.div>

				<m.div
					className="grid grid-cols-1 gap-6"
					layout
					transition={{ duration: 0.5, ease: "easeInOut" }}
				>
					<m.div
						className="space-y-6"
						layout
						transition={{
							duration: 0.5,
							ease: "easeInOut",
						}}
					>
						<div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
							<m.div
								initial={{ opacity: 0, y: -20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3 }}
								className="mb-2 flex items-center justify-between"
							>
								<h2 className="font-bold text-xl">時間割</h2>
								<m.div
									key={courses?.length || 0}
									initial={{ scale: 0.8, opacity: 0 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ duration: 0.2 }}
									className="flex items-center gap-4 text-gray-600 text-sm dark:text-gray-400"
								>
									<p>登録済み講義: {courses.length}件</p>
									{courses.length > 0 && (
										<ConfirmationModal
											triggerButton={
												<DefaultButton size="sm">
													<Check />
													<p className="max-sm:hidden">登録を確定する</p>
												</DefaultButton>
											}
											onConfirm={() => {}}
											title="confirm"
										>
											<div className="space-y-4">
												<p className="text-gray-700 dark:text-gray-300">
													以下の講義を登録してもよろしいですか？
												</p>
												{state.selectedCourse && (
													<div className="space-y-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
														<div className="flex items-start justify-between">
															<div>
																<h4 className="font-semibold text-gray-900 dark:text-white">
																	{state.selectedCourse.name}
																</h4>
																<p className="mt-1 text-gray-600 text-sm dark:text-gray-400">
																	担当教員: {state.selectedCourse.professor}
																</p>
																<p className="text-gray-600 text-sm dark:text-gray-400">
																	単位数: {state.selectedCourse.credits}
																</p>
																<p className="text-gray-600 text-sm dark:text-gray-400">
																	時間割: {state.selectedCourse.weekdays}{" "}
																	{state.selectedCourse.period}
																</p>
															</div>
														</div>
													</div>
												)}
											</div>
										</ConfirmationModal>
									)}
								</m.div>
							</m.div>

							<m.div
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.3, delay: 0.1 }}
							>
								<TimeTableCard
									courses={courses}
									onDeleteCourse={handleDeleteCourse.mutate}
									onCourseSelect={handleRegisterCourses.mutate}
									onCellClick={handleCellClick}
									isLoading={isLoading}
									availableCourses={searchCourses || []}
								/>
							</m.div>
						</div>
					</m.div>
				</m.div>
			</LazyMotionProvider>
		</div>
	);
}
