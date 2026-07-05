# マルチステージビルド - ビルドステージ
FROM oven/bun:latest AS builder

WORKDIR /lms-repo

# 依存関係のコピー
COPY package.json ./
COPY turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/api/package.json ./packages/api/
COPY packages/auth/package.json ./packages/auth/
COPY packages/emails/package.json ./packages/emails/
COPY packages/db/package.json ./packages/db/
COPY packages/ui/package.json ./packages/ui/
COPY packages/env/package.json ./packages/env/
COPY packages/config/package.json ./packages/config/

# 依存関係をインストール
RUN bun install --frozen-lockfile

# ソースコードのコピー
COPY apps/web/src ./apps/web/src
COPY apps/web/public ./apps/web/public
COPY apps/web/index.html ./apps/web/index.html
COPY packages/api/src ./packages/api/src
COPY packages/auth/src ./packages/auth/src
COPY packages/emails/src ./packages/emails/src
COPY packages/db/src ./packages/db/src
COPY packages/ui/src ./packages/ui/src
COPY packages/env/src ./packages/env/src
COPY packages/config/ ./packages/config/

# ビルド
RUN bun run build --filter=web

# 本番ステージ - 静的ファイル配信用
FROM oven/bun:latest AS runner

WORKDIR /lms-repo

# 非rootユーザーの作成
RUN addgroup --system --gid 1001 bun
RUN adduser --system --uid 1001 bun

# ビルド成果物のコピー
COPY --from=builder /lms-repo/apps/web/dist ./apps/web/dist
COPY --from=builder /lms-repo/apps/web/package.json ./apps/web/package.json
COPY --from=builder --chown=bun:bun /lms-repo/node_modules ./node_modules

# ユーザー切り替え
USER bun

# ポートの公開
EXPOSE 3001

# 環境変数
ENV NODE_ENV=production

# 本番サーバーの起動
CMD ["bun", "run", "start:web"]
