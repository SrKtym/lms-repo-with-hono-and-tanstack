import { ListBox } from "@heroui/react";

// 単一選択用のリストボックス
export function SingleSelectListBox({ items }: { items: string[] }) {
	return (
		<ListBox selectionMode="single">
			{items.map((item, index) => (
				<ListBox.Item key={index} id={item} textValue={item} aria-label={item}>
					{item}
					<ListBox.ItemIndicator />
				</ListBox.Item>
			))}
		</ListBox>
	);
}
