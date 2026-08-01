import { Dropdown } from "@heroui/react";
import { MoreVertical } from "@lms-repo/ui/assets/icons/more-vertical";
import { useState } from "react";
import { CancelButton, DefaultButton, DropdownButton } from "../button";
import { InputForForm } from "../input";
import { ControlledModal } from "../modals/controlled-modal";

interface DropdownMenuForProfileProps {
	onUpdateName: (name: string) => Promise<void>;
}

// プロフィールドロップダウンメニュー
export function DropdownMenuForProfile({
	onUpdateName,
}: DropdownMenuForProfileProps) {
	const itemList = [{ key: "update-name", label: "名前を変更" }] as const;
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [value, setValue] = useState("");

	return (
		<>
			<Dropdown>
				<DropdownButton isIconOnly>
					<MoreVertical />
				</DropdownButton>
				<Dropdown.Popover placement="bottom end">
					<Dropdown.Menu>
						{itemList.map(({ key, label }) => (
							<Dropdown.Item
								key={key}
								onPress={() => {
									switch (key) {
										case "update-name":
											setIsModalOpen(true);
											break;
									}
								}}
							>
								{label}
							</Dropdown.Item>
						))}
					</Dropdown.Menu>
				</Dropdown.Popover>
			</Dropdown>

			{isModalOpen && (
				<ControlledModal
					isOpen={isModalOpen}
					onOpenChange={setIsModalOpen}
					heading="ユーザー名を変更"
				>
					<form className="form-field p-1">
						<InputForForm
							inputProps={{
								id: "username",
								name: "username",
								value,
								onChange: (e) => setValue(e.target.value),
								placeholder: "ユーザー名を入力",
							}}
							labelProps={{
								htmlFor: "username",
								children: "新しいユーザー名",
							}}
						/>
						<div className="flex items-center justify-end gap-2">
							<CancelButton onPress={() => setIsModalOpen(false)}>
								キャンセル
							</CancelButton>
							<DefaultButton
								type="submit"
								onPress={async () => {
									await onUpdateName(value);
									setIsModalOpen(false);
								}}
							>
								変更
							</DefaultButton>
						</div>
					</form>
				</ControlledModal>
			)}
		</>
	);
}
