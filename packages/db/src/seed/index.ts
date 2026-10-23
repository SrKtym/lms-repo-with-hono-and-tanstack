import { seedCourseData } from "./seed-course-data";
import { seedUserData } from "./seed-prof-data";

async function main() {
	await seedUserData();
	await seedCourseData();
}

main();
