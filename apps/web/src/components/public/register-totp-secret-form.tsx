import { authClient } from "@lms-repo/auth/web";
import { CancelButton, DefaultButton } from "@lms-repo/ui/components/button";
import { InputOTPFor2fa } from "@lms-repo/ui/components/input-otp";
import { QRCodeComponent } from "@lms-repo/ui/components/qr-code";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { z } from "zod";

export function RegisterTotpSecretForm({ totpURI }: { totpURI: string }) {
	const navigate = useNavigate({
		from: "/",
	});
	const form = useForm({
		defaultValues: {
			totpCode: "",
		},
		onSubmit: ({ value }) => {
			try {
				handleRegisterTotpSecret(value.totpCode);
			} catch (error) {
				console.error(error);
			}
		},
		validators: {
			onSubmit: z.object({
				totpCode: z.string().length(6, "コードは6桁の数字である必要があります"),
			}),
		},
	});

	// TOTPシークレットキーの登録
	const handleRegisterTotpSecret = async (code: string) => {
		await authClient.twoFactor.verifyTotp(
			{ code },
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

	return (
		<div className="flex flex-col items-center gap-4">
			<p>
				以下のQRコードを認証アプリで読み取り、表示されているセキュリティコードを入力してください。
			</p>
			<QRCodeComponent value={totpURI} />
			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="form-field p-1"
				aria-describedby="2fa-setting-error"
			>
				<form.Field name="totpCode">
					{(field) => (
						<div className="space-y-2">
							<InputOTPFor2fa
								name={field.name}
								value={field.state.value}
								onChange={field.handleChange}
							/>
							{field.state.meta.errors.map((error) => (
								<p
									id="totpCode-error"
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
		</div>
	);
}
