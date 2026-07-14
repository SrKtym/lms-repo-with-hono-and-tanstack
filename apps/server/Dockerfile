# Prune ステージ
# 1.turboをインストール
# 2.全ソースをコピーして turbo prune server --docker を実行（必要なファイルのみ抽出）
FROM oven/bun:1.3.12-slim AS prune
WORKDIR /lms-repo
RUN bun add -g turbo
COPY . .
RUN turbo prune server --docker

# Installer ステージ
FROM oven/bun:1.3.12-slim AS installer
WORKDIR /lms-repo

# プルーンされたlockfileを使用して依存関係をインストール
COPY --from=prune /lms-repo/out/json/ .
RUN bun install --frozen-lockfile

# Build ステージ
FROM oven/bun:1.3.12-slim AS builder
WORKDIR /lms-repo

# インストールされた依存関係とプルーンされたソースをコピー
COPY --from=installer /lms-repo/ .
COPY --from=prune /lms-repo/out/full/ .

# Standaloneバイナリ（単一実行可能ファイル）の生成
RUN cd apps/server && bun run compile

# Production ステージ
FROM debian:bookworm-slim AS runner
WORKDIR /lms-repo

# 必要なシステムライブラリのみインストール
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# 非rootユーザーで実行
RUN groupadd --system --gid 1001 bun || true
RUN useradd --system --uid 1001 --gid bun bun || true

# Standaloneバイナリ（server-bytecode）をコピー
COPY --from=builder --chown=bun:bun /lms-repo/apps/server/server-bytecode ./apps/server/server-bytecode

# ユーザー切り替え
USER bun

# ポートの公開（Cloud Runは8080を期待）
EXPOSE 8080

# 環境変数
ENV NODE_ENV=production
ENV PORT=8080

# Standaloneバイナリを実行
CMD ["./apps/server/server-bytecode"]
