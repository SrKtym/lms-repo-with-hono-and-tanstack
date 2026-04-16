import { authClient } from "@lms-repo/auth/web";
import { DefaultButton } from "@lms-repo/ui/components/button";
import { InputForForm } from "@lms-repo/ui/components/input";
import { Loader } from "@lms-repo/ui/components/loader";
import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { SocialLoginField } from "./social-login-field";

export default function SignInForm() {
	const navigate = useNavigate({
		from: "/",
	});

	const { isPending } = authClient.useSession();

	const handlePasskeySignIn = async () => {
		await authClient.signIn.passkey({
			fetchOptions: {
				onSuccess: () => {
					navigate({
						to: "/dashboard",
					});
				},
				onError: (ctx) => {
					console.error(ctx.error.error.message || ctx.error.error.statusText);
				},
			},
		});
	};

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			await authClient.signIn.email(
				{
					email: value.email,
					password: value.password,
				},
				{
					onSuccess: () => {
						navigate({
							to: "/dashboard",
						});
					},
					onError: (error) => {
						console.error(error.error.message || error.error.statusText);
					},
				},
			);
		},
		validators: {
			onSubmit: z.object({
				email: z.email("無効なメールアドレスです"),
				password: z.string().min(8, "パスワードは8文字以上で入力してください"),
			}),
		},
	});

	if (isPending) {
		return <Loader />;
	}

	return (
		<div className="form-container">
			<h1 className="form-header">サインイン</h1>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="form-field"
			>
				<form.Field name="email">
					{(field) => (
						<div className="space-y-2">
							<InputForForm
								inputProps={{
									id: field.name,
									name: field.name,
									type: "email",
									value: field.state.value,
									onBlur: field.handleBlur,
									onChange: (e) => field.handleChange(e.target.value),
								}}
								labelProps={{
									htmlFor: field.name,
									children: "メールアドレス",
								}}
							/>
							{field.state.meta.errors.map((error) => (
								<p key={error?.message} className="text-red-500">
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
									minLength: 8,
									onBlur: field.handleBlur,
									onChange: (e) => field.handleChange(e.target.value),
								}}
								labelProps={{
									htmlFor: field.name,
									children: "パスワード",
								}}
							/>
							{field.state.meta.errors.map((error) => (
								<p key={error?.message} className="text-red-500">
									{error?.message}
								</p>
							))}
						</div>
					)}
				</form.Field>

				<SocialLoginField onPasskeySignIn={handlePasskeySignIn} />

				<form.Subscribe>
					{({ canSubmit, isSubmitting }) => (
						<DefaultButton
							type="submit"
							className="w-full"
							isDisabled={!canSubmit || isSubmitting}
						>
							{isSubmitting ? "処理中..." : "サインイン"}
						</DefaultButton>
					)}
				</form.Subscribe>
			</form>

			<div className="mt-4 flex flex-col items-center gap-2 text-center">
				<Link to="/sign-up" className="default-link">
					アカウントをお持ちでない方
				</Link>
				<Link to="/request-reset-password" className="default-link">
					パスワードをお忘れの方
				</Link>
			</div>
		</div>
	);
}
