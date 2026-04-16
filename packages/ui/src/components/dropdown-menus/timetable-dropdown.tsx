import { Dropdown } from "@heroui/react";
import { Edit } from "../../assets/icons/edit";
import { Trash } from "../../assets/icons/trash";
import { DropdownButton } from "../button";

// Timetable dropdown menu
export function DropdownMenuForTimeTable() {
	const manageCourses = [
		{ key: "edit-courses", label: "Edit", icon: <Edit /> },
		{ key: "delete-courses", label: "Delete", icon: <Trash /> },
	] as const;

	return (
		<Dropdown>
			<DropdownButton />
			<Dropdown.Popover>
				<Dropdown.Menu>
					<Dropdown.Section>
						{manageCourses.map(({ key, label, icon }) => (
							<Dropdown.Item key={key} className="flex items-center gap-2">
								<span>{icon}</span>
								<p>{label}</p>
							</Dropdown.Item>
						))}
					</Dropdown.Section>
				</Dropdown.Menu>
			</Dropdown.Popover>
		</Dropdown>
	);
}
