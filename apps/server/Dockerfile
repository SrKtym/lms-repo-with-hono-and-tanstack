### Prune ステージ
FROM oven/bun:1.3.12-slim AS prune
WORKDIR /lms-repo

# 1.turboをインストール
RUN bun add -g turbo

# 2.全ソースをコピーして turbo prune server --docker を実行（必要なファイルのみ抽出）
COPY . .
RUN turbo prune server --docker

### Installer ステージ
FROM oven/bun:1.3.12-slim AS installer
WORKDIR /lms-repo

# 1.プルーンされたlockfileを使用して依存関係をインストール
COPY --from=prune /lms-repo/out/json/ .
RUN bun install --frozen-lockfile

### Build ステージ
FROM oven/bun:1.3.12-slim AS builder
WORKDIR /lms-repo

# 1.インストールされた依存関係とプルーンされたソースをコピー
COPY --from=installer /lms-repo/ .
COPY --from=prune /lms-repo/out/full/ .

# 2.Standaloneバイナリ（単一実行可能ファイル）の生成
RUN cd apps/server && bun run compile

### Runner ステージ（DistrolessにはシェルがないためRUN命令は実行できない）
FROM gcr.io/distroless/base-debian12 AS runner
WORKDIR /lms-repo

# 1.Standaloneバイナリ（server-bytecode）をコピー
COPY --from=builder \
    --chown=nonroot:nonroot \
    /lms-repo/apps/server/server-bytecode \
    ./apps/server/server-bytecode

# 2.非rootユーザー（組み込みユーザー）で実行
USER nonroot:nonroot

# 3.ポートの公開（Cloud Runは8080を期待）
EXPOSE 8080

# 4.環境変数の設定
ENV NODE_ENV=production
ENV PORT=8080

# 5.Standaloneバイナリを実行
CMD ["./apps/server/server-bytecode"]
