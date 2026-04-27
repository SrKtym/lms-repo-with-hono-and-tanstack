import { authClient } from "@lms-repo/auth/web";
import { DefaultButton } from "@lms-repo/ui/components/button";
import { InputForForm } from "@lms-repo/ui/components/input";
import { useForm } from "@tanstack/react-form";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";

export default function RequestResetPasswordForm() {
	const [error, setError] = useState<string>("");
	const [isSuccess, setIsSuccess] = useState(false);

	const form = useForm({
		defaultValues: {
			email: "",
		},
		onSubmit: async ({ value }) => {
			try {
				setError("");
				setIsSuccess(false);
				
				await authClient.requestPasswordReset(
					{
						email: value.email,
						redirectTo: "/reset-password",
					},
					{
						onError: (error) => {
							const errorMessage =
								error.error.message ||
								error.error.statusText ||
								"リセットメールの送信に失敗しました";
							setError(errorMessage);
						},
					},
				);

				setIsSuccess(true);
			} catch (err) {
				setError("予期しないエラーが発生しました。お手数ですが再度試行してください。");
			}
		},
		validators: {
			onSubmit: z.object({
				email: z.email("有効なメールアドレスを入力してください"),
			}),
		},
	});

	return (
		<div className="w-full space-y-6">
			{/* Header Section */}
			<div className="text-center">
				<div className="mb-6 flex justify-center">
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
						<svg
							className="h-6 w-6 text-orange-600 dark:text-orange-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
							/>
						</svg>
					</div>
				</div>
				<h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
					パスワードのリセット
				</h3>
				<p className="text-gray-600 text-sm dark:text-gray-400">
					メールアドレスを入力することで、パスワードをリセットするためのメールが送信されます。
				</p>
			</div>

			{/* Form */}
			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="space-y-4"
				aria-describedby="request-reset-password-error"
			>
				<form.Field name="email">
					{(field) => (
						<div className="space-y-3">
							<InputForForm
								inputProps={{
									id: field.name,
									name: field.name,
									type: "email",
									value: field.state.value,
									"aria-describedby": "email-error",
									onBlur: field.handleBlur,
									onChange: (e) => {
										field.handleChange(e.target.value);
										setError(""); // Clear error on input
									},
									placeholder: "メールアドレスを入力してください",
									className: "w-full",
								}}
								labelProps={{
									children: "メールアドレス",
								}}
							/>
							{field.state.meta.errors.map((error) => (
								<p id="email-error" key={error?.message} className="text-red-500 text-sm">
									{error?.message}
								</p>
							))}
						</div>
					)}
				</form.Field>

				{/* Error Message */}
				{error && (
					<div className="rounded-md bg-red-50 p-3 dark:bg-red-900/20">
						<p id="request-reset-password-error" className="text-red-600 text-sm dark:text-red-400">{error}</p>
					</div>
				)}

				{/* Success Message */}
				{isSuccess && (
					<div className="rounded-md bg-green-50 p-3 dark:bg-green-900/20">
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
								<h4 className="font-medium text-green-800 dark:text-green-200">
									リセットメールを送信しました
								</h4>
								<p className="text-green-600 text-sm dark:text-green-400">
									メールアドレスを確認してください
								</p>
							</div>
						</div>
					</div>
				)}

				{/* Submit Button */}
				<form.Subscribe
					selector={(state) => ({
						canSubmit: state.canSubmit,
						isSubmitting: state.isSubmitting,
					})}
				>
					{({ canSubmit, isSubmitting }) => (
						<DefaultButton
							type="submit"
							className="w-full"
							isDisabled={!canSubmit || isSubmitting || isSuccess}
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
									リセットリンクを送信中...
								</>
							) : (
								"リセットリンクを送信"
							)}
						</DefaultButton>
					)}
				</form.Subscribe>
			</form>

			{/* Success State - Additional Info */}
			{isSuccess && (
				<div className="text-center">
					<p className="text-gray-500 text-sm dark:text-gray-400">
						メールが届かない場合は、スパムフォルダを確認するか、もう一度お試しください
					</p>
				</div>
			)}

			{/* Back to Sign In */}
			<div className="text-center">
				<Link
					to="/sign-in"
					className="text-blue-600 text-sm hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
				>
					サインインに戻る
				</Link>
			</div>
		</div>
	);
}
