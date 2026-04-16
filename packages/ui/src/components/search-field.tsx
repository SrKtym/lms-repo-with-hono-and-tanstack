import { SearchField } from "@heroui/react";

// 汎用検索フィールド
export function DefaultSearchField({
	placeholder,
	ariaLabel = "Search",
}: {
	placeholder?: string;
	ariaLabel?: string;
}) {
	return (
		<SearchField name="search" aria-label={ariaLabel}>
			<SearchField.Group>
				<SearchField.SearchIcon />
				<SearchField.Input placeholder={placeholder} />
				<SearchField.ClearButton />
			</SearchField.Group>
		</SearchField>
	);
}
