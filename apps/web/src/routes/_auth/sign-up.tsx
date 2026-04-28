import { authClient } from "@lms-repo/auth/web";
import { DefaultButton } from "@lms-repo/ui/components/button";
import { InputForForm } from "@lms-repo/ui/components/input";
import { Loader } from "@lms-repo/ui/components/loader";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { SocialLoginField } from "@/components/public/social-login-field";

export const Route = createFileRoute("/_auth/sign-up")({
	component: RouteComponent,
});

function RouteComponent() {
	const [error, setError] = useState<string>("");
	const [success, setSuccess] = useState({
		isSuccess: false,
		email: "",
	});
	const { isPending } = authClient.useSession();

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
			name: "",
		},
		onSubmit: async ({ value }) => {
			try {
				await authClient.signUp.email(
					{
						email: value.email,
						password: value.password,
						name: value.name,
					},
					{
						onSuccess: () => {
							setSuccess({
								isSuccess: true,
								email: value.email,
							});
						},
						onError: (error) => {
							setError(error.error.message);
						},
					},
				);
			} catch (error) {
				setError(
					"予期しないエラーが発生しました。お手数ですが再度試行してください。",
				);
			}
		},
		validators: {
			onSubmit: z.object({
				name: z.string().min(1, "名前は1文字以上である必要があります"),
				email: z.email("有効なメールアドレスを入力してください"),
				password: z
					.string()
					.min(8, "パスワードは8文字以上である必要があります"),
			}),
		},
	});

	if (isPending) {
		return <Loader />;
	}

	return (
		<div className="form-container">
			<h1 className="form-header">サインアップ</h1>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="form-field"
				aria-describedby="sign-up-error"
			>
				<form.Field name="name">
					{(field) => (
						<div className="space-y-2">
							<InputForForm
								inputProps={{
									id: field.name,
									name: field.name,
									value: field.state.value,
									placeholder: "例: 山田太郎",
									"aria-describedby": "name-error",
									onBlur: field.handleBlur,
									onChange: (e) => field.handleChange(e.target.value),
								}}
								labelProps={{
									htmlFor: field.name,
									children: "ユーザー名",
								}}
							/>
							{field.state.meta.errors.map((error) => (
								<p
									id="name-error"
									key={error?.message}
									className="text-red-500"
								>
									{error?.message}
								</p>
							))}
						</div>
					)}
				</form.Field>

				<form.Field name="email">
					{(field) => (
						<div className="space-y-2">
							<InputForForm
								inputProps={{
									id: field.name,
									name: field.name,
									type: "email",
									value: field.state.value,
									placeholder: "例: example@example.com",
									"aria-describedby": "email-error",
									onBlur: field.handleBlur,
									onChange: (e) => field.handleChange(e.target.value),
								}}
								labelProps={{
									htmlFor: field.name,
									children: "メールアドレス",
								}}
							/>
							{field.state.meta.errors.map((error) => (
								<p
									id="email-error"
									key={error?.message}
									className="text-red-500"
								>
									{error?.message}
								</p>
							))}
						</div>
					)}
				</form.Field>

				<form.Field name="password">
					{(field) => (
						<div className="space-y-2">
							<InputForForm
								inputProps={{
									id: field.name,
									name: field.name,
									type: "password",
									value: field.state.value,
									placeholder: "例: password123",
									minLength: 8,
									"aria-describedby": "password-error",
									onBlur: field.handleBlur,
									onChange: (e) => field.handleChange(e.target.value),
								}}
								labelProps={{
									htmlFor: field.name,
									children: "パスワード",
								}}
							/>
							{field.state.meta.errors.map((error) => (
								<p
									id="password-error"
									key={error?.message}
									className="text-red-500"
								>
									{error?.message}
								</p>
							))}
						</div>
					)}
				</form.Field>

				{/* Error Message */}
				{error && (
					<div
						id="sign-up-error"
						className="rounded-md bg-red-50 p-3 dark:bg-red-900/20"
					>
						<p className="text-red-600 text-sm dark:text-red-400">{error}</p>
					</div>
				)}

				{/* Success Message */}
				{success.isSuccess && (
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
							<p className="text-green-600 text-sm dark:text-green-400">
								{success.email}{" "}
								への確認メールを送信しました。メール内のリンクをクリックしてアカウントを有効化してください。
							</p>
						</div>
					</div>
				)}

				<SocialLoginField />

				<form.Subscribe>
					{({ canSubmit, isSubmitting }) => (
						<DefaultButton
							type="submit"
							className="w-full"
							isDisabled={!canSubmit || isSubmitting}
						>
							{isSubmitting ? "処理中..." : "サインアップ"}
						</DefaultButton>
					)}
				</form.Subscribe>
			</form>

			<div className="mt-4 text-center">
				<Link to="/sign-in" className="default-link">
					アカウントをお持ちの方
				</Link>
			</div>
		</div>
	);
}
