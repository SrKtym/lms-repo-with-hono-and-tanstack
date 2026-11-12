import type {
	FetchCreatedCoursesReturnType,
	FetchRegisteredCoursesReturnType,
} from "@lms-repo/db/utils/query/courses";

// カバー画像を生成して講義データに追加する関数
export function addCoverImagesToCourses(
	courses: FetchRegisteredCoursesReturnType | FetchCreatedCoursesReturnType,
) {
	const dataLength = courses.length;
	const coverImageList = Array.from(
		{ length: dataLength },
		(_, i) => `https://img.heroui.chat/image/landscape?w=1200&h=400&u=${i + 1}`,
	);
	const coursesWithCoverImage = courses.map((course, index) => ({
		...course,
		coverImage: coverImageList[index],
	}));
	return coursesWithCoverImage;
}
