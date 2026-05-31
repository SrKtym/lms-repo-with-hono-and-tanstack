export const TrendingUp = ({
	width,
	height,
}: {
	width?: number;
	height?: number;
}) => (
	<svg
		aria-label="trending-up"
		xmlns="http://www.w3.org/2000/svg"
		width={width}
		height={height}
		viewBox="0 0 24 24"
	>
		<title>Trending Up</title>
		<g
			fill="none"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
		>
			<path d="M16 7h6v6" strokeDasharray={20} strokeDashoffset={20}>
				<animate
					fill="freeze"
					attributeName="stroke-dashoffset"
					dur="0.3s"
					to={0}
				/>
			</path>
			<path
				d="m22 7l-8.5 8.5l-5-5L2 17"
				strokeDasharray={30}
				strokeDashoffset={30}
			>
				<animate
					fill="freeze"
					attributeName="stroke-dashoffset"
					begin="0.3s"
					dur="0.4s"
					to={0}
				/>
			</path>
		</g>
	</svg>
);
