// ルートレイアウト

import { DefaultButton } from "@lms-repo/ui/components/button";
import { ThemeProvider } from "@lms-repo/ui/components/theme-provider";
import {
	createRootRouteWithContext,
	type ErrorComponentProps,
	HeadContent,
	Link,
	Outlet,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import "../index.css";

export type RouterAppContext = {};

export const Route = createRootRouteWithContext<RouterAppContext>()({
	component: RootComponent,
	errorComponent: ErrorComponent,
	notFoundComponent: NotFoundComponent,
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

// NotFoundコンポーネント
function NotFoundComponent() {
	return (
		<div className="flex min-h-screen items-center justify-center px-4">
			<div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800">
				<div className="mb-4 text-center">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
						<svg
							className="h-8 w-8 text-yellow-600 dark:text-yellow-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</div>
					<h1 className="mb-2 font-bold text-2xl text-gray-900 dark:text-white">
						ページが見つかりません
					</h1>
					<p className="mb-4 text-gray-600 dark:text-gray-400">
						申し訳ありません。指定されたページが見つかりませんでした。
					</p>
					<p className="mb-6 text-gray-500 text-sm dark:text-gray-400">
						URLが正しいか、またはページが移動または削除されていないか確認してください。
					</p>
				</div>
				<div className="flex flex-col gap-3">
					<Link to="/">
						<DefaultButton className="w-full">ホームに戻る</DefaultButton>
					</Link>
					<Link to=".">
						<DefaultButton variant="outline" className="w-full">
							前のページに戻る
						</DefaultButton>
					</Link>
				</div>
			</div>
		</div>
	);
}

// エラーコンポーネント
function ErrorComponent({ error }: ErrorComponentProps) {
	return (
		<div className="flex min-h-screen items-center justify-center px-4">
			<div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800">
				<div className="mb-4 text-center">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
						<svg
							className="h-8 w-8 text-red-600 dark:text-red-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
							/>
						</svg>
					</div>
					<h1 className="mb-2 font-bold text-2xl text-gray-900 dark:text-white">
						エラーが発生しました
					</h1>
					<p className="mb-4 text-gray-600 dark:text-gray-400">
						申し訳ありません。予期しないエラーが発生しました。
					</p>
					{error && (
						<div className="mb-6 rounded-md bg-red-50 p-3 text-red-800 text-sm dark:bg-red-900/20 dark:text-red-400">
							{error.message || "不明なエラー"}
						</div>
					)}
				</div>
				<div className="flex flex-col gap-3">
					<Link to=".">
						<DefaultButton className="w-full">ページを再読み込み</DefaultButton>
					</Link>
					<Link to="/">
						<DefaultButton variant="outline" className="w-full">
							ホームに戻る
						</DefaultButton>
					</Link>
				</div>
			</div>
		</div>
	);
}
