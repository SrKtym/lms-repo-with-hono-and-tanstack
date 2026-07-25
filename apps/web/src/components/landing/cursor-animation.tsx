import { Cursor } from "@lms-repo/ui/assets/icons/cursor";
import * as m from "motion/react-m";

interface CursorAnimationProps {
	isClicking: boolean;
	position: { x: number; y: number };
}

export function CursorAnimation({
	isClicking,
	position,
}: CursorAnimationProps) {
	return (
		<m.div
			initial={{ opacity: 0 }}
			animate={{
				opacity: 1,
				scale: isClicking ? 0.8 : 1,
				x: position.x,
				y: position.y,
			}}
			exit={{ opacity: 0 }}
			transition={{
				duration: 0.5,
				ease: "easeOut",
				scale: { duration: 0.1, ease: "easeInOut" },
			}}
			className="absolute top-0 left-0 z-30 flex h-9 w-9 items-center justify-center"
		>
			<Cursor />
		</m.div>
	);
}
