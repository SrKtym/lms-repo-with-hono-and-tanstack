# Prune ステージ
# 1.turboをインストール
# 2.全ソースをコピーして turbo prune server --docker を実行（必要なファイルのみ抽出）
FROM oven/bun:latest AS prune
WORKDIR /app
RUN bun add -g turbo
COPY . .
RUN turbo prune server --docker

# Installer ステージ
FROM oven/bun:latest AS installer
WORKDIR /app
# プルーンされたlockfileを使用して依存関係をインストール
COPY --from=prune /app/out/json/ .
RUN bun install --frozen-lockfile

# Build ステージ
FROM oven/bun:latest AS builder
WORKDIR /app
# インストールされた依存関係とプルーンされたソースをコピー
COPY --from=installer /app/ .
COPY --from=prune /app/out/full/ .
# ビルド
RUN bun run build --filter=server
# Standaloneバイナリをコンパイル
RUN cd apps/server && bun run compile

# Production ステージ
FROM oven/bun:latest AS runner
WORKDIR /app

# 非rootユーザーで実行
RUN groupadd --system --gid 1001 bun || true
RUN useradd --system --uid 1001 --gid bun bun || true

# Standaloneバイナリをコピー
COPY --from=builder --chown=bun:bun /app/apps/server/server ./apps/server/server

# ユーザー切り替え
USER bun

# ポートの公開（Cloud Runは8080を期待）
EXPOSE 8080

# 環境変数
ENV NODE_ENV=production
ENV PORT=8080

# Standaloneバイナリを実行
CMD ["./apps/server/server"]
