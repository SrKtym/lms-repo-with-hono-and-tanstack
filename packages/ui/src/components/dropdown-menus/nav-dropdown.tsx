import { Dropdown } from "@heroui/react";
import { Menu } from "@lms-repo/ui/assets/icons/menu";
import type { LinkComponentProps } from "@lms-repo/ui/utils/link";
import { getHeaderLinks } from "@lms-repo/ui/utils/link";
import { DropdownButton } from "../button";

// ナビゲーションドロップダウンメニュー
export function DropdownMenuForNavLink({
	LinkComponent,
}: {
	LinkComponent: React.ComponentType<LinkComponentProps>;
}) {
	const links = getHeaderLinks(24, 24);
	return (
		<Dropdown>
			<DropdownButton className="md:hidden">
				<Menu />
			</DropdownButton>
			<Dropdown.Popover>
				<Dropdown.Menu>
					<Dropdown.Section className="max-sm:text-lg">
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
