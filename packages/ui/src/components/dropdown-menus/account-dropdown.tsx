import { Dropdown, Label } from "@heroui/react";
import type React from "react";
import { useState } from "react";
import { DropdownButton } from "../button";
import { LogoutModal } from "../modals/logout-modal";

// Account dropdown menu
export function DropdownMenuForAccount({
	children,
	onLogout,
}: {
	children: React.ReactNode;
	onLogout: () => void;
}) {
	const itemList = [
		{ key: "profile", label: "プロフィール" },
		{ key: "settings", label: "設定" },
		{ key: "logout", label: "ログアウト" },
	] as const;

	const [isModalOpen, setIsModalOpen] = useState(false);

	return (
		<>
			<Dropdown>
				<DropdownButton>{children}</DropdownButton>
				<Dropdown.Popover placement="bottom end">
					<Dropdown.Menu>
						<Dropdown.Section>
							{itemList.map(({ key, label }) => (
								<Dropdown.Item
									key={key}
									onPress={() => {
										switch (key) {
											case "profile":
												// TODO: プロフィールページに遷移
												break;
											case "settings":
												// TODO: 設定ページに遷移
												break;
											case "logout":
												setIsModalOpen(true);
												break;
										}
									}}
								>
									<Label>{label}</Label>
								</Dropdown.Item>
							))}
						</Dropdown.Section>
					</Dropdown.Menu>
				</Dropdown.Popover>
			</Dropdown>

			{isModalOpen && (
				<LogoutModal
					isOpen={isModalOpen}
					onOpenChange={setIsModalOpen}
					onLogout={onLogout}
				/>
			)}
		</>
	);
}
