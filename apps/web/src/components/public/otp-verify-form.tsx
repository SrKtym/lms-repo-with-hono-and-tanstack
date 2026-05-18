import { authClient } from "@lms-repo/auth/web";
import { DefaultButton, OutlineButton } from "@lms-repo/ui/components/button";
import { InputOTPFor2fa } from "@lms-repo/ui/components/input-otp";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import z from "zod";

export default function OtpVerifyForm({
	onSuccess,
}: {
	onSuccess: () => void;
}) {
	const [error, setError] = useState<string>("");
	const [isSuccess, setIsSuccess] = useState(false);
	const [otpSent, setOtpSent] = useState(false);
	const [resendTimer, setResendTimer] = useState(0);

	const verifyForm = useForm({
		defaultValues: {
			otp: "",
		},
		onSubmit: async ({ value }) => {
			try {
				setError("");
				setIsSuccess(false);

				await authClient.twoFactor.verifyOtp(
					{
						code: value.otp,
					},
					{
						onSuccess: () => {
							setIsSuccess(true);
							onSuccess();
						},
						onError: () => {
							setError(
								"認証コードが正しくありません。もう一度お試しください。",
							);
						},
					},
				);
			} catch (err) {
				setError(
					"予期しないエラーが発生しました。お手数ですが再度試行してください。",
				);
			}
		},
		validators: {
			onSubmit: z.object({
				otp: z.string().length(6, "認証コードは6桁で入力してください"),
			}),
		},
	});

	const sendOtpForm = useForm({
		onSubmit: async () => {
			try {
				setError("");
				await authClient.twoFactor.sendOtp({
					fetchOptions: {
						onSuccess: () => {
							setOtpSent(true);
							startResendTimer();
						},
						onError: () => {
							setError("メールの送信に失敗しました。もう一度お試しください。");
						},
					},
				});
			} catch (err) {
				setError(
					"予期しないエラーが発生しました。お手数ですが再度試行してください。",
				);
			}
		},
	});

	// メール再送信までのカウントダウン
	const startResendTimer = () => {
		setResendTimer(60);
		const timer = setInterval(() => {
			setResendTimer((prev) => {
				if (prev <= 1) {
					clearInterval(timer);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
	};

	// メール再送信
	const handleResendOtp = () => {
		if (resendTimer === 0) {
			sendOtpForm.handleSubmit();
		}
	};

	return (
		<div className="flex w-full flex-col items-center space-y-6">
			{/* ヘッダー情報 */}
			<div className="text-center">
				<div className="mb-4 flex justify-center">
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
						<svg
							className="h-6 w-6 text-green-600 dark:text-green-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
							/>
						</svg>
					</div>
				</div>
				<h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
					SMS/メール認証
				</h3>
				<p className="text-gray-600 text-sm dark:text-gray-400">
					登録済みの電話番号またはメールアドレスに送信された6桁のコードを入力してください
				</p>
			</div>

			{/* OTP送信フォーム */}
			{!otpSent ? (
				<div className="space-y-4">
					<sendOtpForm.Subscribe>
						{({ canSubmit, isSubmitting }) => (
							<OutlineButton
								onPress={() => sendOtpForm.handleSubmit()}
								isDisabled={!canSubmit || isSubmitting}
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
										送信中...
									</>
								) : (
									"認証コードを送信"
								)}
							</OutlineButton>
						)}
					</sendOtpForm.Subscribe>
				</div>
			) : (
				/* OTP検証フォーム */
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						verifyForm.handleSubmit();
					}}
					className="space-y-4"
				>
					<verifyForm.Field name="otp">
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
					</verifyForm.Field>

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

					<verifyForm.Subscribe>
						{({ canSubmit, isSubmitting }) => (
							<DefaultButton
								type="submit"
								className="w-full"
								isDisabled={!canSubmit || isSubmitting}
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
					</verifyForm.Subscribe>

					{/* 再送信ボタン */}
					<div className="text-center">
						<OutlineButton
							onPress={handleResendOtp}
							isDisabled={resendTimer > 0}
						>
							{resendTimer > 0
								? `再送信可能まで ${resendTimer} 秒`
								: "認証コードを再送信"}
						</OutlineButton>
					</div>
				</form>
			)}

			{/* ヘルプセクション */}
			<div className="text-center">
				<p className="text-gray-500 text-xs dark:text-gray-400">
					コードが届かない場合は、迷惑メールフォルダもご確認ください
				</p>
			</div>
		</div>
	);
}
