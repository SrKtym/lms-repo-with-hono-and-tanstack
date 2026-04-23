import type { UserData } from "@lms-repo/auth/web";
import { Books } from "@lms-repo/ui/assets/icons/books";
import { DefaultAvatar } from "@lms-repo/ui/components/avatar";
import { DropdownMenuForAccount } from "@lms-repo/ui/components/dropdown-menus/account-dropdown";
import {
	DropdownMenuForNavLink,
	links,
} from "@lms-repo/ui/components/dropdown-menus/nav-dropdown";
import { DefaultSeparator } from "@lms-repo/ui/components/separator";
import { ThemeSwitch } from "@lms-repo/ui/components/switch";
import { cn } from "@lms-repo/ui/lib/utils";
import { Link, useLocation } from "@tanstack/react-router";

export function Header({ email, name, image }: UserData) {
	const location = useLocation();

	return (
		<>
			<div className="flex flex-row items-center justify-between px-3 py-2">
				<nav className="flex items-center gap-4 text-lg">
					<DropdownMenuForNavLink LinkComponent={Link} />
					<div className="flex items-center gap-2">
						<Books />
						<h1 className="font-bold text-3xl">LMS</h1>
					</div>
					<DefaultSeparator orientation="vertical" className="max-md:hidden" />
					{links.map(({ icon, to, label }) => {
						return (
							<Link
								key={to}
								to={to}
								className={cn(
									"nav-link nav-link-shrink",
									location.pathname === to && "nav-link-active",
								)}
							>
								<span>{icon}</span>
								<p>{label}</p>
							</Link>
						);
					})}
				</nav>
				<div className="flex items-center gap-2">
					<ThemeSwitch />
					<DropdownMenuForAccount>
						<DefaultAvatar src={image} userName={name} />
						<div className="flex flex-col text-start text-foreground max-sm:hidden">
							<h3>{name}</h3>
							<p className="text-gray-500 text-sm dark:text-gray-400">
								{email}
							</p>
						</div>
					</DropdownMenuForAccount>
				</div>
			</div>
			<hr />
		</>
	);
}
