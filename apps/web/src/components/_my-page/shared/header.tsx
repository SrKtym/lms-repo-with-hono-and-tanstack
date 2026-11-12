import { authClient } from "@lms-repo/auth/web";
import type { UserDataTypeWithImage } from "@lms-repo/db/types";
import { Books } from "@lms-repo/ui/assets/icons/books";
import { DashBoard } from "@lms-repo/ui/assets/icons/dashboard";
import { List } from "@lms-repo/ui/assets/icons/list";
import { DropdownMenuForAccount } from "@lms-repo/ui/components/dropdown-menus/account-dropdown";
import { DropdownMenuForNavLink } from "@lms-repo/ui/components/dropdown-menus/nav-dropdown";
import { DefaultSeparator } from "@lms-repo/ui/components/separator";
import { ThemeSwitch } from "@lms-repo/ui/components/switch";
import { toast } from "@lms-repo/ui/components/toast";
import { getHeaderLinks } from "@lms-repo/ui/utils/link";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";

export function Header({ email, name, image, role }: UserDataTypeWithImage) {
	const location = useLocation();
	const navigate = useNavigate();

	const links = getHeaderLinks(24, 24);

	// トースト表示
	function showToast(error: { status: number }) {
		switch (error.status) {
			case 400:
			case 404:
				toast.danger("ログアウトに失敗しました");
				break;
			case 500:
				toast.danger(
					"予期しないエラーが発生しました。お手数ですが再度試行してください。",
				);
		}
	}

	// ログアウト処理
	const handleLogout = async () => {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					navigate({ to: "/" });
				},
				onError: ({ error }) => {
					showToast(error);
				},
			},
		});
	};

	return (
		<div className="sticky inset-x-0 top-0 z-50 backdrop-blur-lg">
			<div className="flex flex-row items-center justify-between px-3 py-2">
				<nav className="flex items-center gap-4 text-lg">
					{role === "student" && (
						<DropdownMenuForNavLink LinkComponent={Link} />
					)}
					<div className="flex items-center gap-2">
						<Books />
						<h1 className="text-3xl font-bold">LMS</h1>
					</div>
					<DefaultSeparator orientation="vertical" className="max-md:hidden" />
					{role === "student" &&
						links.map(({ icon, to, label }) => {
							return (
								<Link
									key={to}
									to={to}
									className={`nav-link nav-link-shrink ${location.pathname === to && "nav-link-active"}
								`}
								>
									<span>{icon}</span>
									<p>{label}</p>
								</Link>
							);
						})}
					{role === "professor" && (
						<Link
							to="/prof/my-courses"
							className={`nav-link ${location.pathname === "/prof/my-courses" && "nav-link-active"}
								`}
						>
							<List />
							<p>講義の管理</p>
						</Link>
					)}
					{role === "admin" && (
						<Link
							to="/admin"
							className={`nav-link ${location.pathname === "/admin" && "nav-link-active"}
								`}
						>
							<DashBoard />
							<p>管理者ダッシュボード</p>
						</Link>
					)}
				</nav>
				<div className="flex items-center gap-2">
					<ThemeSwitch />
					<DropdownMenuForAccount
						email={email}
						name={name}
						image={image}
						LinkComponent={Link}
						onLogout={handleLogout}
					/>
				</div>
			</div>
			<hr />
		</div>
	);
}
