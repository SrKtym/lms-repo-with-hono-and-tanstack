# マルチステージビルド - ビルドステージ
FROM oven/bun:latest AS builder

WORKDIR /lms-repo

# 依存関係のコピー
COPY package.json ./
COPY turbo.json ./
COPY apps/server/package.json ./apps/server/
COPY packages/api/package.json ./packages/api/
COPY packages/auth/package.json ./packages/auth/
COPY packages/emails/package.json ./packages/emails/
COPY packages/db/package.json ./packages/db/
COPY packages/env/package.json ./packages/env/
COPY packages/config/package.json ./packages/config/

# 依存関係をインストール
RUN bun install --frozen-lockfile

# ソースコードのコピー
COPY apps/server/src ./apps/server/src
COPY packages/api/src ./packages/api/src
COPY packages/auth/src ./packages/auth/src
COPY packages/emails/src ./packages/emails/src
COPY packages/db/src ./packages/db/src
COPY packages/env/src ./packages/env/src
COPY packages/config/ ./packages/config/

# ビルド
RUN bun run build --filter=server

# 本番ステージ
FROM oven/bun:latest AS runner

WORKDIR /lms-repo

# 非rootユーザーの作成（Debian用コマンドを使用）
RUN groupadd --system --gid 1001 bun
RUN useradd --system --uid 1001 --gid bun bun

# 必要なファイルのみコピー
COPY --from=builder /lms-repo/apps/server/dist ./apps/server/dist
COPY --from=builder /lms-repo/apps/server/package.json ./apps/server/package.json
COPY --from=builder --chown=bun:bun /lms-repo/node_modules ./node_modules

# ユーザー切り替え
USER bun

# ポートの公開
EXPOSE 3000

# 環境変数
ENV NODE_ENV=production

# 本番サーバーの起動
CMD ["bun", "run", "start:server"]
