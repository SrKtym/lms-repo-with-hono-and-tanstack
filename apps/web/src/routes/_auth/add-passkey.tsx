import { authClient } from "@lms-repo/auth/web";
import { CancelButton, DefaultButton } from "@lms-repo/ui/components/button";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/_auth/add-passkey")({
	component: RouteComponent,
});

function RouteComponent() {
	const [isRegistering, setIsRegistering] = useState(false);
	const [error, setError] = useState<string>("");
	const [isSuccess, setIsSuccess] = useState(false);

	const handleAddPasskey = async () => {
		try {
			setIsRegistering(true);
			setError("");
			setIsSuccess(false);

			const { error } = await authClient.passkey.addPasskey();

			if (error) {
				setError(
					"パスキーの登録に失敗しました。お手数ですが再度試行してください。",
				);
			} else {
				setIsSuccess(true);
			}
		} catch {
			setError(
				"予期しないエラーが発生しました。お手数ですが再度試行してください。",
			);
		} finally {
			setIsRegistering(false);
		}
	};

	return (
		<div className="mx-auto max-w-md space-y-8">
			{/* Header Section */}
			<div className="text-center">
				<div className="mb-6 flex justify-center">
					<div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700">
						<svg
							className="h-8 w-8 text-white"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
							/>
						</svg>
					</div>
				</div>
				<h1 className="mb-3 font-bold text-2xl text-gray-900 dark:text-gray-100">
					パスキー登録
				</h1>
				<p className="text-gray-600 dark:text-gray-400">
					パスワードレス認証でセキュリティを強化しましょう
				</p>
			</div>

			{/* Main Card */}
			<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
				{/* Success Message */}
				{isSuccess && (
					<div className="mb-6 rounded-md bg-green-50 p-4 dark:bg-green-900/20">
						<div className="flex items-center">
							<svg
								className="mr-3 h-5 w-5 text-green-600 dark:text-green-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<div>
								<h3 className="font-medium text-green-800 dark:text-green-200">
									登録が成功しました
								</h3>
								<p className="text-green-600 text-sm dark:text-green-400">
									パスキーが正常に登録されました。これで、安全なログインに使用できます。
								</p>
							</div>
						</div>
					</div>
				)}

				{/* Error Message */}
				{error && (
					<div className="mb-6 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
						<div className="flex items-center">
							<svg
								className="mr-3 h-5 w-5 text-red-600 dark:text-red-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<div>
								<h3 className="font-medium text-red-800 dark:text-red-200">
									登録に失敗しました
								</h3>
								<p className="text-red-600 text-sm dark:text-red-400">
									{error}
								</p>
							</div>
						</div>
					</div>
				)}

				{/* Information Section */}
				{!isSuccess && (
					<div className="mb-6 space-y-4">
						<div className="flex items-start space-x-3">
							<div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
								<svg
									className="h-3 w-3 text-blue-600 dark:text-blue-400"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fillRule="evenodd"
										d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
							<div className="flex-1">
								<p className="text-gray-700 text-sm dark:text-gray-300">
									<span className="font-medium">パスワードレスログイン:</span>{" "}
									パスワードではなく、パスキーを使用して安全に認証します
								</p>
							</div>
						</div>

						<div className="flex items-start space-x-3">
							<div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
								<svg
									className="h-3 w-3 text-green-600 dark:text-green-400"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fillRule="evenodd"
										d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
							<div className="flex-1">
								<p className="text-gray-700 text-sm dark:text-gray-300">
									<span className="font-medium">生体認証:</span>
									パスワードではなく、指紋や顔認証、デバイスのPINを使用して認証します
								</p>
							</div>
						</div>

						<div className="flex items-start space-x-3">
							<div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
								<svg
									className="h-3 w-3 text-purple-600 dark:text-purple-400"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fillRule="evenodd"
										d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
							<div className="flex-1">
								<p className="text-gray-700 text-sm dark:text-gray-300">
									<span className="font-medium">クイックアクセス:</span>
									パスワードを覚える必要なく、ワンタップでログインできます
								</p>
							</div>
						</div>
					</div>
				)}

				{/* Action Buttons */}
				<div className="space-y-3">
					{!isSuccess ? (
						<DefaultButton
							className="w-full"
							onPress={handleAddPasskey}
							isDisabled={isRegistering}
						>
							{isRegistering ? (
								<>
									<svg
										className="mr-2 h-4 w-4 animate-spin"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										/>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										/>
									</svg>
									パスキーを登録中...
								</>
							) : (
								"パスキーを登録"
							)}
						</DefaultButton>
					) : (
						<Link to="/dashboard">
							<DefaultButton className="w-full">
								ダッシュボードへ移動
							</DefaultButton>
						</Link>
					)}

					<Link to="/dashboard">
						<CancelButton className="w-full" isDisabled={isRegistering}>
							今はしない
						</CancelButton>
					</Link>
				</div>
			</div>

			{/* Footer Help Text */}
			<div className="text-center">
				<p className="text-gray-500 text-xs dark:text-gray-400">
					アカウント設定から、後からでもパスキーを登録できます
				</p>
			</div>
		</div>
	);
}
