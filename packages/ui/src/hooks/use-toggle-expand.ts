import { useState } from "react";

interface UseToggleExpandOptions {
	onExpand?: (id: string) => void;
}

// トグル展開機能を提供するフック
export function useToggleExpand(options?: UseToggleExpandOptions) {
	const [expandedId, setExpandedId] = useState<string | null>(null);

	const toggleExpand = (e: React.MouseEvent, id: string) => {
		e.stopPropagation();
		if (expandedId === id) {
			setExpandedId(null);
		} else {
			setExpandedId(id);
			options?.onExpand?.(id);
		}
	};

	return { expandedId, toggleExpand };
}
