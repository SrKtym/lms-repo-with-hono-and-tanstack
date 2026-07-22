このプロジェクトは進行中です。

# LMS-repo

このプロジェクトは、[Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack)をベースに構築されています。 以下に、使用されている主要な技術スタックを示します。

## 技術スタック

- **TypeScript** - For type safety and improved developer experience
- **TanStack Router** - File-based routing with full type safety
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **Hero UI package** - Hero UI primitives live in `packages/ui`
- **Hono** - Lightweight, performant server framework
- **Bun** - Runtime environment
- **Drizzle** - TypeScript-first ORM
- **PostgreSQL** - Database engine
- **Authentication** - Better-Auth
- **Turborepo** - Optimized monorepo build system
- **Biome** - Linting and formatting

## 始め方

はじめに、依存関係をインストールします:

```bash
npm install
```

または

```bash
pnpm install
```

または

```bash
bun install
```

dockerを使用する場合(任意)

```bash
docker compose -f docker/docker-compose.dev.yml up -d
```

その後、開発サーバーを起動します（dockerを使用する場合は以下のコマンドは不要）:

```bash
bun run dev
```

フロントエンドアプリケーションは、ブラウザ上の[http://localhost:3001](http://localhost:3001)で開きます。
バックエンドアプリケーションは、[http://localhost:3000](http://localhost:3000)で実行されます。

## データベースのセットアップ

このプロジェクトではPostgreSQLとDrizzle ORMを使用します。

1. PostgreSQLデータベースのセットアップを行います。
2. プロジェクト内に `apps/server/.env` ファイルを作成し、PostgreSQLに接続するために必要な環境変数を設定します。

3. Drizzle ORMを使ってTypeScriptで記述されたデータベースのスキーマから、 SQLマイグレーションファイルを生成します。:

```bash
bun run db:generate
```
4. 生成されたSQLマイグレーションファイルをPostgreSQLデータベースに適用します。:

```bash
bun run db:migrate
```

## UIのカスタマイズ

- Hero UIベースのものや再利用性のあるコンポーネントは `packages/ui/src/components/*`に集約されます。
- SVGアイコンのような静的アセットはReactコンポーネントとして`packages/ui/src/assets/icons`に集約されます。
- 各コンポーネントに適用するCSSの共通設定は `packages/ui/src/styles/globals.css`内で行います。

## フォーマットとリント

- Biomeによるコードのフォーマットとリントを実行します:
`bun run check`

## プロジェクトの構成

```
lms-repo/
├── apps/
│   ├── web/         # フロントエンドアプリケーション (React + TanStack Router)
│   └── server/      # バックエンドアプリケーション (Hono)
├── packages/
|   |── api/         # APIルート（Hono）
|   |── auth/        # 認証ロジック（Better Auth）
|   |── config/      # packages/の共通設定
|   |── db/          # データベース（postgres）のスキーマとクエリ
|   |── emails/      # メールテンプレート
│   ├── ui/          # Hero UIベースのコンポーネント
```

## 利用可能なスクリプト

- `bun run dev`: 開発モードですべてのアプリケーションを実行
- `bun run build`: すべてのアプリケーションをビルド
- `bun run dev:web`: フロントエンドアプリケーションのみ実行
- `bun run dev:server`: バックエンドアプリケーションのみ実行
- `bun run check-types`: すべてのアプリケーションをまたいだ型チェック
- `bun run db:push`: スキーマの変更を直接データベースに反映
- `bun run db:generate`: マイグレーションファイルの生成
- `bun run db:migrate`: データベースへのマイグレーションを実行
- `bun run db:studio`: Drizzle Studioの起動
- `bun run check`: Biomeによるフォーマットとリント
