このプロジェクトは進行中です。

# LMS-repoの概要

- このプロジェクトは、[Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack)をベースに構築されています。
- LMS-repoは、大学生と教員が利用することを想定した学習管理システムです。
- 学生は履修可能な講義を選んで登録し、時間割を作成することができます。講義に関連する教員からの通知を受け取ったり、指定されたファイル形式で提出物を提出したりすることもできます。また、アプリ内で学生個人のスケジュールを作成・編集することもできます。
- 一方、教員は講義の作成や課題の作成、学生の提出物の採点などを行うことができます。
- デフォルトでは、新規登録時にユーザーは学生として登録されます。教員用の登録機能は未実装です。
- アプリの使用例を確認したい場合は、ホームページの「チュートリアル」をご確認ください。

## 主要な使用技術

- **TypeScript** - 型安全なJavaScript拡張言語で、開発体験を向上させます
- **React** - ユーザーインターフェースを構築するためのJavaScriptライブラリ
- **TanStack Router** - ファイルベースのルーティングで、完全な型安全性を提供します
- **TailwindCSS** - ユーティリティファーストのCSSで、迅速なUI開発を可能にします
- **Hero UI** - TailwindCSSとReact AriaをベースにしたUIコンポーネントライブラリ
- **Hono** - 軽量で高性能なWebフレームワーク
- **Bun** - JavaScriptランタイム環境、パッケージマネージャー
- **Drizzle** - TypeScript向けのORM
- **PostgreSQL** - リレーショナルデータベース
- **Better-Auth** - 認証・認可ライブラリ
- **Turborepo** - 最適化されたモノレポビルドシステム
- **Biome** - リンター、フォーマッター

使用技術の詳細は以下のページを参照してください。

- [使用技術の詳細](https://docs.google.com/spreadsheets/d/1ulwv8rPPF7eSvMoAQ4dYs8eY2HbrgR318JS1peeHCcM/edit?gid=0#gid=0)

## システム構成図

## プロジェクトの構成とデプロイフロー

このプロジェクトの構成は、フロントエンドとバックエンドが1つのリポジトリにまとめられるモノレポ構成となっております。

```
lms-repo-with-hono-and-tanstack/
├──.github/
|   └── workflows/   # GitHub Actionsのワークフロー
├── apps/
|   ├── web/         # フロントエンドアプリケーション (React + TanStack Router)
|   └── server/      # バックエンドアプリケーション (Hono)
├── packages/
|   |── api/         # APIルート（Hono）
|   |── auth/        # 認証・認可ロジック（Better Auth）
|   |── config/      # packages/の共通設定
|   |── db/          # データベース（postgres）のスキーマとクエリ
|   |── emails/      # メールテンプレートとResendのインスタンス生成
|   └── ui/          # Hero UIベースのコンポーネント
├── docker/
|   ├── docker-compose.dev.yml  # Docker Composeの開発環境設定ファイル
|   └── docker-compose.test.yml  # Docker Composeのテスト環境設定ファイル
|   ...
|   ...
|
├── biome.json       # Biomeの設定ファイル
├── bun.lock         # Bunの依存関係ロックファイル
├── package.json     # ルートのパッケージ設定
├── turbo.json       # Turborepoの設定ファイル
└── wrangler.jsonc   # Cloudflare Pagesの設定ファイル
```

## 画面構成図

このWebアプリケーションの画面構成図は以下のようになります。

## ER図

データベースの論理設計について説明します。packages/db内にはこのWebアプリケーションで使用するデータベースのスキーマが定義されています。drizzle ORMを使って、TypeScriptで2つのスキーマ「better_auth」、「public」が記述されています。「better_auth」は認証情報（ユーザー、セッション、トークンなど）を格納するスキーマで、「public」はアプリケーションの主要な業務データ（講義、課題、スケジュールなど）を格納するデフォルトのスキーマです。前者は認証・認可ライブラリのBetter-Authが提供するスキーマであり、以下のコマンドで生成されます（Better-Auth公式ドキュメント参照: https://better-auth.com/docs/concepts/cli）。

```bash
bun x auth@latest generate
```

開発者が自らテーブルの設計をする必要はありません。以下に「better_auth」スキーマのER図を示します。


