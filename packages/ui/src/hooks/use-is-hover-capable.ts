import { useEffect, useState } from "react";

export function useIsHoverCapable() {
	const [isHoverCapable, setIsHoverCapable] = useState(false);

	useEffect(() => {
		// ホバーに対応しているデバイスかどうかを判定
		const mediaQuery = window.matchMedia("(hover: hover)");
		setIsHoverCapable(mediaQuery.matches);

		const handleChange = (e: MediaQueryListEvent) => {
			setIsHoverCapable(e.matches);
		};

		// メディアクエリの変更を購読
		mediaQuery.addEventListener("change", handleChange);

		return () => {
			// コンポーネントがアンマウントされるときに購読を解除
			mediaQuery.removeEventListener("change", handleChange);
		};
	}, []);

	return isHoverCapable;
}
