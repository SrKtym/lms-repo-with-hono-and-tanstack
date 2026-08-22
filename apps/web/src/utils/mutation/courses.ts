import type { Courses, CoursesOptional } from "@lms-repo/db/types";
import { client } from "@/lib/hono-client";

// 講義を作成するmutationFn
export const createCourseMutationFn = async (
	courseData: Omit<Courses, CoursesOptional>,
) => {
	const res = await client.api.professors.courses.$post({
		json: courseData,
	});
	const data = await res.json();
	return data;
};

// 講義を登録するmutationFn
export const registerCourseMutationFn = async (courseId: string) => {
	const res = await client.api.students.courses.registered.$post({
		json: { courseId },
	});
	const data = await res.json();
	return data;
};

// 講義を登録解除するmutationFn
export const unregisterCourseMutationFn = async (courseId: string) => {
	const res = await client.api.students.courses.registered.$delete({
		json: { courseId },
	});
	const data = await res.json();
	return data;
};

// 登録講義を確定するmutationFn
export const checkCourseMutationFn = async () => {
	const res = await client.api.students.courses.registered.$patch();
	const data = await res.json();
	return data;
};
