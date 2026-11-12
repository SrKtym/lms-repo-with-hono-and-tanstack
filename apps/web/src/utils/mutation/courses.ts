import type { formSchema } from "@lms-repo/api/schema/courses";
import type { z } from "zod";
import { client } from "@/lib/hono-client";

type CourseData = z.infer<typeof formSchema>;

// 講義を作成するmutationFn
export const createCourseMutationFn = async (courseData: CourseData) => {
	const res = await client.api.professors.courses.$post({
		json: courseData,
	});
	const data = await res.json();
	return data;
};

// 講義を登録するmutationFn
export const registerCourseMutationFn = async (courseId: string) => {
	const res = await client.api.students.courses.registrations[
		":course-id"
	].$post({
		param: { "course-id": courseId },
	});
	const data = await res.json();
	return data;
};

// 講義を登録解除するmutationFn
export const unregisterCourseMutationFn = async (courseId: string) => {
	const res = await client.api.students.courses.registrations[
		":course-id"
	].$delete({
		param: { "course-id": courseId },
	});
	const data = await res.json();
	return data;
};

// 登録講義を確定するmutationFn
export const checkCourseMutationFn = async () => {
	const res = await client.api.students.courses.registrations.confirm.$patch();
	const data = await res.json();
	return data;
};
