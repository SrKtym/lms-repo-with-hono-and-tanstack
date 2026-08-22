export const ArrowRight = ({
	width,
	height,
	className,
}: {
	width?: number;
	height?: number;
	className?: string;
}) => (
	<svg
		width={width ?? 24}
		height={height ?? 24}
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		className={className}
	>
		<title>Arrow Right</title>
		<path
			d="M9 18L15 12L9 6"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);
