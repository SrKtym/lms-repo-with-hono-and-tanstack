import { Dropdown } from "@heroui/react";
import type React from "react";
import { useState } from "react";
import type { LinkComponentProps } from "../../lib/utils";
import { DefaultAvatar } from "../avatar";
import { CancelButton, DefaultButton, DropdownButton } from "../button";
import { ControlledModal } from "../modals/controlled-modal";

interface DropdownMenuForAccountProps {
	email: string;
	name: string;
	image?: string | null;
	LinkComponent: React.ComponentType<LinkComponentProps>;
	onLogout: () => void;
}

// アカウントドロップダウンメニュー
export function DropdownMenuForAccount({
	email,
	name,
	image,
	LinkComponent,
	onLogout,
}: DropdownMenuForAccountProps) {
	const itemList = [
		{ key: "profile", label: "プロフィールと設定" },
		{ key: "logout", label: "ログアウト" },
	] as const;

	const [isModalOpen, setIsModalOpen] = useState(false);

	return (
		<>
			<Dropdown>
				<DropdownButton>
					<DefaultAvatar src={image} userName={name} />
					<div className="flex flex-col text-start text-foreground max-sm:hidden">
						<h3>{name}</h3>
						<p className="text-gray-500 text-sm dark:text-gray-400">{email}</p>
					</div>
				</DropdownButton>
				<Dropdown.Popover placement="bottom end">
					<Dropdown.Menu>
						<Dropdown.Section className="max-sm:text-lg">
							{itemList.map(({ key, label }) => {
								switch (key) {
									case "profile":
										return (
											<Dropdown.Item key={key}>
												<LinkComponent to={`/${key}`}>{label}</LinkComponent>
											</Dropdown.Item>
										);
									case "logout":
										return (
											<Dropdown.Item
												key={key}
												onPress={() => {
													setIsModalOpen(true);
												}}
											>
												{label}
											</Dropdown.Item>
										);
									default:
										return null;
								}
							})}
						</Dropdown.Section>
					</Dropdown.Menu>
				</Dropdown.Popover>
			</Dropdown>

			{isModalOpen && (
				<ControlledModal
					isOpen={isModalOpen}
					onOpenChange={setIsModalOpen}
					heading="ログアウトの確認"
					size="lg"
					footer={
						<>
							<CancelButton onPress={() => setIsModalOpen(false)}>
								キャンセル
							</CancelButton>
							<DefaultButton onPress={onLogout}>ログアウト</DefaultButton>
						</>
					}
				>
					<p className="text-foreground">ログアウトしますか？</p>
				</ControlledModal>
			)}
		</>
	);
}
