### Prune ステージ
# 1.turboをインストール
# 2.全ソースをコピーして turbo prune server --docker を実行（必要なファイルのみ抽出）
FROM oven/bun:1.3.12-slim AS prune
WORKDIR /lms-repo
RUN bun add -g turbo
COPY . .
RUN turbo prune server --docker

### Installer ステージ
FROM oven/bun:1.3.12-slim AS installer
WORKDIR /lms-repo

# プルーンされたlockfileを使用して依存関係をインストール
COPY --from=prune /lms-repo/out/json/ .
RUN bun install --frozen-lockfile

### Build ステージ
FROM oven/bun:1.3.12-slim AS builder
WORKDIR /lms-repo

# インストールされた依存関係とプルーンされたソースをコピー
COPY --from=installer /lms-repo/ .
COPY --from=prune /lms-repo/out/full/ .

# Standaloneバイナリ（単一実行可能ファイル）の生成
RUN cd apps/server && bun run compile

### Runner ステージ（DistrolessにはシェルがないためRUN命令は実行できない）
FROM gcr.io/distroless/base-debian12 AS runner
WORKDIR /lms-repo

# Standaloneバイナリ（server-bytecode）をコピー
COPY --from=builder \
    --chown=nonroot:nonroot \
    /lms-repo/apps/server/server-bytecode \
    ./apps/server/server-bytecode

# 非rootユーザー（組み込みユーザー）で実行
USER nonroot:nonroot

# ポートの公開（Cloud Runは8080を期待）
EXPOSE 8080

# 環境変数
ENV NODE_ENV=production
ENV PORT=8080

# Standaloneバイナリを実行
CMD ["./apps/server/server-bytecode"]
