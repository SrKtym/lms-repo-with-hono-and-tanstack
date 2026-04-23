import { Dropdown } from "@heroui/react";
import { CalendarClock } from "@lms-repo/ui/assets/icons/calendar-clock";
import { DashBoard } from "@lms-repo/ui/assets/icons/dashboard";
import { List } from "@lms-repo/ui/assets/icons/list";
import { Menu } from "@lms-repo/ui/assets/icons/menu";
import { MessagesSquare } from "@lms-repo/ui/assets/icons/messages-square";
import { SquarePlus } from "@lms-repo/ui/assets/icons/square-plus";
import { DropdownButton } from "../button";

export const links = [
	{
		icon: <DashBoard width={24} height={24} />,
		to: "/dashboard",
		label: "ダッシュボード",
	},
	{
		icon: <SquarePlus width={24} height={24} />,
		to: "/register-courses",
		label: "履修登録",
	},
	{
		icon: <List width={24} height={24} />,
		to: "/course-list/{-$course-id}/{-$content-id}",
		label: "履修一覧",
	},
	{
		icon: <CalendarClock width={24} height={24} />,
		to: "/schedules",
		label: "スケジュール",
	},
	{
		icon: <MessagesSquare width={24} height={24} />,
		to: "/notifications",
		label: "通知",
	},
] as const;

// Navigation dropdown menu
export function DropdownMenuForNavLink({
	LinkComponent,
}: {
	LinkComponent: React.ComponentType<{
		to: string;
		children: React.ReactNode;
	}>;
}) {
	return (
		<Dropdown>
			<DropdownButton className="md:hidden">
				<Menu />
			</DropdownButton>
			<Dropdown.Popover>
				<Dropdown.Menu>
					<Dropdown.Section>
						{links.map(({ to, label }) => (
							<Dropdown.Item key={to}>
								<LinkComponent to={to}>{label}</LinkComponent>
							</Dropdown.Item>
						))}
					</Dropdown.Section>
				</Dropdown.Menu>
			</Dropdown.Popover>
		</Dropdown>
	);
}
