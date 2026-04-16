// ルートレイアウト
import { ThemeProvider } from "@lms-repo/ui/components/theme-provider";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import "../index.css";

export type RouterAppContext = {};

export const Route = createRootRouteWithContext<RouterAppContext>()({
	component: RootComponent,
	errorComponent: () => <div>エラー: not found</div>,
	head: () => ({
		meta: [
			{
				title: "lms-repo",
			},
			{
				name: "description",
				content: "lms-repo is a web application",
			},
		],
		links: [
			{
				rel: "icon",
				href: "/favicon.ico",
			},
		],
	}),
});

function RootComponent() {
	return (
		<>
			<HeadContent />
			<div className="min-h-screen">
				{/* Background Gradient - HeroSection inspired */}
				<div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" />

				{/* Decorative Elements - HeroSection inspired */}
				<div className="pointer-events-none absolute inset-0 overflow-hidden">
					<div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-gradient-to-br from-blue-400/10 to-purple-400/10 blur-3xl" />
					<div className="absolute right-10 bottom-20 h-96 w-96 rounded-full bg-gradient-to-tr from-purple-400/10 to-pink-400/10 blur-3xl" />
					<div className="absolute top-1/4 left-1/4 h-60 w-60 rounded-full bg-gradient-to-br from-blue-300/5 to-cyan-300/5 blur-2xl" />
				</div>

				{/* Main Content */}
				<div className="relative z-10">
					<ThemeProvider
						attribute="class"
						defaultTheme="dark"
						disableTransitionOnChange
						storageKey="vite-ui-theme"
					>
						<Outlet />
					</ThemeProvider>
				</div>
			</div>
			<TanStackRouterDevtools position="bottom-left" />
		</>
	);
}
