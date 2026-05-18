import { Surface } from "@heroui/react";

interface TabItem {
	id: string;
	label: string;
	icon?: string;
}

interface ProfileTabsProps {
	tabs: TabItem[];
	activeTab: string;
	onTabChange: (tabId: string) => void;
	className?: string;
}

export function ProfileTabs({
	tabs,
	activeTab,
	onTabChange,
	className = "",
}: ProfileTabsProps) {
	return (
		<Surface className={`w-full ${className}`}>
			<nav className="p-2">
				<ul className="space-y-1">
					{tabs.map((tab) => (
						<li key={tab.id}>
							<button
								onClick={() => onTabChange(tab.id)}
								className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors duration-200 sm:gap-3 sm:px-4 sm:py-3 ${
									activeTab === tab.id
										? "bg-primary-100 font-medium text-primary-700"
										: "text-foreground-600 hover:bg-foreground-50 hover:text-foreground"
								}`}
							>
								{tab.icon && (
									<span className="text-base sm:text-lg">{tab.icon}</span>
								)}
								<span className="text-sm sm:text-base">{tab.label}</span>
							</button>
						</li>
					))}
				</ul>
			</nav>
		</Surface>
	);
}
