import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { Schedule as ScheduleType } from "@/components/private/schedule";
import { Schedule } from "@/components/private/schedule";

export const Route = createFileRoute("/_my-page/schedules")({
	component: RouteComponent,
});

function RouteComponent() {
	const [schedules, setSchedules] = useState<ScheduleType[]>([
		{
			id: "1",
			title: "",
			start: new Date("2025-10-20T10:00:00"),
			end: new Date("2025-10-20T11:00:00"),
		},
	]);

	const handleCreateSchedule = (newSchedule: Omit<ScheduleType, "id">) => {
		const scheduleWithId: ScheduleType = {
			...newSchedule,
			id: Date.now().toString(),
		};
		setSchedules([...schedules, scheduleWithId]);
	};

	return (
		<Schedule
			schedules={schedules}
			onCreateSchedule={handleCreateSchedule}
			courses={[
				{
					id: "1",
					name: "",
					instructor: "",
					credits: "",
					schedule: "",
				},
			]}
		/>
	);
}
