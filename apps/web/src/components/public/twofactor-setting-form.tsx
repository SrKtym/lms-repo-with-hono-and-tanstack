import { authClient } from "@lms-repo/auth/web";
import { CancelButton, DefaultButton } from "@lms-repo/ui/components/button";
import { InputForForm } from "@lms-repo/ui/components/input";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { z } from "zod";

export function TwoFactorSettingForm({
	selected,
	setTotpURI,
}: {
	selected: string;
	setTotpURI: (totpURI: string) => void;
}) {
	const navigate = useNavigate({
		from: "/",
	});
	const form = useForm({
		defaultValues: {
			password: "",
		},
		onSubmit: ({ value }) => {
			try {
				handleSetTwofactor(value.password);
			} catch (error) {
				console.error(error);
			}
		},
		validators: {
			onSubmit: z.object({
				password: z.string().min(8, "パスワードは8文字以上で入力してください"),
			}),
		},
	});

	// 2要素認証の有効化
	const handleValidTwofactor = async (password: string) => {
		const { data, error } = await authClient.twoFactor.enable(
			{ password },
			{
				onSuccess: () => {
					if (data) setTotpURI(data.totpURI);
				},
				onError: () => {
					console.error(error?.message || error?.statusText);
				},
			},
		);
	};

	// 2要素認証の無効化
	const handleInvalidTwofactor = async (password: string) => {
		await authClient.twoFactor.disable(
			{ password },
			{
				onSuccess: () =>
					navigate({
						to: "/add-passkey",
					}),
				onError: ({ error }) => {
					console.error(error.message || error.statusText);
				},
			},
		);
	};

	const handleSetTwofactor = (password: string) => {
		console.log("handleSetTwofactor", password);
		if (selected === "valid") handleValidTwofactor(password);
		else if (selected === "invalid") handleInvalidTwofactor(password);
		else return;
	};

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="form-field p-1"
			aria-describedby="2fa-setting-error"
		>
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

			<div className="flex justify-end gap-2">
				<CancelButton slot="close">キャンセル</CancelButton>
				<form.Subscribe>
					{({ canSubmit, isSubmitting }) => (
						<DefaultButton
							type="submit"
							isDisabled={!canSubmit || isSubmitting}
						>
							{isSubmitting ? "処理中..." : "作成"}
						</DefaultButton>
					)}
				</form.Subscribe>
			</div>
		</form>
	);
}
