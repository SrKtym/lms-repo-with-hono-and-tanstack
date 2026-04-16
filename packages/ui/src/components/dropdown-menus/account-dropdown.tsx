import { Dropdown, Label } from "@heroui/react";
import { DropdownButton } from "../button";

// Account dropdown menu
export function DropdownMenuForAccount({
	children,
}: {
	children: React.ReactNode;
}) {
	const itemList = [
		{ key: "profile", label: "プロフィール" },
		{ key: "settings", label: "設定" },
		{ key: "logout", label: "ログアウト" },
	] as const;

	return (
		<Dropdown>
			<DropdownButton>{children}</DropdownButton>
			<Dropdown.Popover placement="bottom end">
				<Dropdown.Menu>
					<Dropdown.Section>
						{itemList.map(({ key, label }) => (
							<Dropdown.Item key={key}>
								<Label>{label}</Label>
							</Dropdown.Item>
						))}
					</Dropdown.Section>
				</Dropdown.Menu>
			</Dropdown.Popover>
		</Dropdown>
	);
}
