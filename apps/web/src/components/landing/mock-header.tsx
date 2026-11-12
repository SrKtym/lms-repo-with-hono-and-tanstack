import { Books } from "@lms-repo/ui/assets/icons/books";
import { DefaultAvatar } from "@lms-repo/ui/components/avatar";
import { DefaultSeparator } from "@lms-repo/ui/components/separator";
import { ThemeSwitch } from "@lms-repo/ui/components/switch";
import { getHeaderLinks } from "@lms-repo/ui/utils/link";

export function MockHeader() {
	const links = getHeaderLinks(24, 24);
	return (
		<div className="sticky inset-x-0 top-0 z-50 backdrop-blur-lg">
			<div className="flex flex-row items-center justify-between px-3 py-2">
				<nav className="flex items-center gap-4 text-lg">
					<div className="flex items-center gap-2">
						<Books />
						<h1 className="text-3xl font-bold">LMS</h1>
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
