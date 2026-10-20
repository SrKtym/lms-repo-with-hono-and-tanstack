import { Button } from "@heroui/react";
import { Edit } from "@lms-repo/ui/assets/icons/edit";
import { Trash } from "@lms-repo/ui/assets/icons/trash";
import * as m from "motion/react-m";

// 汎用ボタン
export function DefaultButton(props: React.ComponentProps<typeof Button>) {
	return <Button variant="primary" {...props} />;
}

// キャンセルボタン
export function CancelButton(props: React.ComponentProps<typeof Button>) {
	return <Button variant="tertiary" {...props} />;
}

// 危険ボタン（重要アクション用）
export function DangerButton(props: React.ComponentProps<typeof Button>) {
	return <Button variant="danger" {...props} />;
}

// アウトラインボタン
export function OutlineButton(props: React.ComponentProps<typeof Button>) {
	return (
		<Button fullWidth variant="outline" {...props}>
			{props.children}
		</Button>
	);
}

// ドロップダウンボタン
export function DropdownButton(props: React.ComponentProps<typeof Button>) {
	return <Button className="h-auto p-2" variant="secondary" {...props} />;
}

type MenuActionType = "edit" | "delete";

interface MenuActionButtonProps {
	type: MenuActionType;
	onClick: (e?: React.MouseEvent) => void;
}

// メニューアクションボタン
export function MenuActionButton({ type, onClick }: MenuActionButtonProps) {
	const isEdit = type === "edit";
	const Icon = isEdit ? Edit : Trash;
	const label = isEdit ? "編集" : "削除";
	const sharedStyle = "flex items-center gap-2 rounded px-3 py-2 text-sm";
	const className = isEdit
		? "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
		: "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20";

	return (
		<m.button
			whileHover={{ scale: 1.05 }}
			whileTap={{ scale: 0.95 }}
			onClick={onClick}
			className={`${sharedStyle} ${className}`}
		>
			<Icon width={16} height={16} />
			<p>{label}</p>
		</m.button>
	);
}
