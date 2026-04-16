import { authClient } from "@lms-repo/auth/web";
import { DefaultButton } from "@lms-repo/ui/components/button";
import { InputForForm } from "@lms-repo/ui/components/input";
import { Loader } from "@lms-repo/ui/components/loader";
import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { SocialLoginField } from "./social-login-field";

export default function SignUpForm() {
	const navigate = useNavigate({
		from: "/",
	});
	const { isPending } = authClient.useSession();

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
			name: "",
		},
		onSubmit: async ({ value }) => {
			await authClient.signUp.email(
				{
					email: value.email,
					password: value.password,
					name: value.name,
				},
				{
					onSuccess: () => {
						navigate({
							to: "/dashboard",
						});
					},
					onError: (error) => {
						console.error("Sign up failed", error);
					},
				},
			);
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
									onBlur: field.handleBlur,
									onChange: (e) => field.handleChange(e.target.value),
								}}
								labelProps={{
									htmlFor: field.name,
									children: "ユーザー名",
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
									placeholder: "例: password123",
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
