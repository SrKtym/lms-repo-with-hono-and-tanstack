import { Books } from "@lms-repo/ui/assets/icons/books";
import { DefaultAvatar } from "@lms-repo/ui/components/avatar";
import { links } from "@lms-repo/ui/components/dropdown-menus/nav-dropdown";
import { DefaultSeparator } from "@lms-repo/ui/components/separator";
import { ThemeSwitch } from "@lms-repo/ui/components/switch";

export function MockHeader() {
	return (
		<div className="sticky inset-x-0 top-0 z-50 backdrop-blur-lg">
			<div className="flex flex-row items-center justify-between px-3 py-2">
				<nav className="flex items-center gap-4 text-lg">
					<div className="flex items-center gap-2">
						<Books />
						<h1 className="font-bold text-3xl">LMS</h1>
					</div>
					<DefaultSeparator orientation="vertical" className="max-md:hidden" />
					{links.map(({ icon, to, label }) => (
						<div key={to} className="nav-link nav-link-shrink">
							<span>{icon}</span>
							<p>{label}</p>
						</div>
					))}
				</nav>
				<div className="flex items-center gap-2">
					<ThemeSwitch />
					<DefaultAvatar userName="田中 太郎" />
				</div>
			</div>
			<hr />
		</div>
	);
}
