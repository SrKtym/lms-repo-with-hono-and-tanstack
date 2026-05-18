import { Surface } from "@heroui/react";
import { ArrowRight } from "@lms-repo/ui/assets/icons/arrow-right";
import type { LinkComponentProps } from "../../lib/utils";
import { DefaultButton } from "../button";

export function AccountSettings({
	LinkComponent,
}: {
	LinkComponent: React.ComponentType<LinkComponentProps>;
}) {
	return (
		<Surface className="mx-auto w-full max-w-2xl rounded-2xl p-6 shadow-surface">
			<h2 className="mb-6 font-bold text-foreground text-xl">アカウント設定</h2>

			<div className="space-y-6">
				{/* 2要素認証 */}
				<div className="flex flex-col rounded-lg border border-divider p-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="mb-4 sm:mb-0">
						<h3 className="mb-1 font-medium text-foreground">2要素認証</h3>
						<p className="text-foreground-600 text-sm">
							アカウントのセキュリティを強化するために2要素認証を有効化することを推奨します
						</p>
					</div>
					<LinkComponent to="/set-twofactor">
						<DefaultButton variant="primary" size="sm">
							設定ページへ
							<ArrowRight />
						</DefaultButton>
					</LinkComponent>
				</div>

				{/* パスキー */}
				<div className="flex flex-col rounded-lg border border-divider p-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="mb-4 sm:mb-0">
						<h3 className="mb-1 font-medium text-foreground">パスキー</h3>
						<p className="text-foreground-600 text-sm">
							生体認証やセキュリティキーを使用して安全にログインできます
						</p>
					</div>
					<LinkComponent to="/add-passkey">
						<DefaultButton variant="primary" size="sm">
							設定ページへ
							<ArrowRight />
						</DefaultButton>
					</LinkComponent>
				</div>

				{/* パスワードリセット */}
				<div className="flex flex-col rounded-lg border border-divider p-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="mb-4 sm:mb-0">
						<h3 className="mb-1 font-medium text-foreground">
							パスワードのリセット
						</h3>
						<p className="text-foreground-600 text-sm">
							セキュリティのため、定期的にパスワードを変更することを推奨します
						</p>
					</div>
					<LinkComponent to="/request-reset-password">
						<DefaultButton variant="primary" size="sm">
							設定ページへ
							<ArrowRight />
						</DefaultButton>
					</LinkComponent>
				</div>
			</div>
		</Surface>
	);
}
