import { authClient } from "@lms-repo/auth/web";
import { DefaultButton } from "@lms-repo/ui/components/button";
import { InputOTPFor2fa } from "@lms-repo/ui/components/input-otp";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import z from "zod";

interface TotpVerifyFormProps {
	onSuccess?: () => void;
	isActive?: boolean;
}

export default function TotpVerifyForm({
	onSuccess,
	isActive = true,
}: TotpVerifyFormProps) {
	const [error, setError] = useState<string>("");
	const [isSuccess, setIsSuccess] = useState(false);

	const form = useForm({
		defaultValues: {
			totp: "",
		},
		onSubmit: async ({ value }) => {
			try {
				setError("");
				setIsSuccess(false);

				await authClient.twoFactor.verifyTotp({
					code: value.totp,
				});

				setIsSuccess(true);
				onSuccess?.();
			} catch (err) {
				setError("認証コードが正しくありません。もう一度お試しください。");
				console.error("TOTP verification error:", err);
			}
		},
		validators: {
			onSubmit: z.object({
				totp: z.string().length(6, "認証コードは6桁で入力してください"),
			}),
		},
	});

	const handleResendCode = async () => {
		try {
			// TOTPの場合は再送信の概念がないが、ユーザーにフィードバックを提供
			setError("");
			setIsSuccess(false);
		} catch (err) {
			console.error("Resend error:", err);
		}
	};

	return (
		<div className="w-full space-y-6">
			{/* ヘッダー情報 */}
			<div className="text-center">
				<div className="mb-4 flex justify-center">
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
						<svg
							className="h-6 w-6 text-blue-600 dark:text-blue-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
							/>
						</svg>
					</div>
				</div>
				<h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
					認証アプリのコード
				</h3>
				<p className="text-gray-600 text-sm dark:text-gray-400">
					Google
					Authenticatorや他の認証アプリに表示されている6桁のコードを入力してください
				</p>
			</div>

			{/* フォーム */}
			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="space-y-4"
			>
				<form.Field name="totp">
					{(field) => (
						<div className="space-y-3">
							<InputOTPFor2fa
								name={field.name}
								value={field.state.value}
								onChange={(value) => {
									field.handleChange(value);
									setError(""); // 入力時にエラーをクリア
								}}
							/>
							{field.state.meta.errors.map((error) => (
								<p key={error?.message} className="text-red-500 text-sm">
									{error?.message}
								</p>
							))}
						</div>
					)}
				</form.Field>

				{/* エラーメッセージ */}
				{error && (
					<div className="rounded-md bg-red-50 p-3 dark:bg-red-900/20">
						<p className="text-red-600 text-sm dark:text-red-400">{error}</p>
					</div>
				)}

				{/* 成功メッセージ */}
				{isSuccess && (
					<div className="rounded-md bg-green-50 p-3 dark:bg-green-900/20">
						<p className="text-green-600 text-sm dark:text-green-400">
							認証に成功しました！
						</p>
					</div>
				)}

				<form.Subscribe>
					{({ canSubmit, isSubmitting }) => (
						<DefaultButton
							type="submit"
							className="w-full"
							isDisabled={!canSubmit || isSubmitting || !isActive}
						>
							{isSubmitting ? (
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
									認証中...
								</>
							) : (
								"認証コードを確認"
							)}
						</DefaultButton>
					)}
				</form.Subscribe>
			</form>

			{/* ヘルプセクション */}
			<div className="text-center">
				<p className="text-gray-500 text-xs dark:text-gray-400">
					コードが表示されない場合は、認証アプリの時刻を同期してください
				</p>
			</div>
		</div>
	);
}
