import arcjet, { detectBot, shield, tokenBucket } from "@arcjet/bun";
import { env } from "@lms-repo/env/server";

export const aj = arcjet({
	key: env.ARCJET_KEY,
	rules: [
		// 一般的な攻撃（OWASP Top10に列挙される攻撃）からアプリケーションを保護する
		shield({ mode: "LIVE" }),
		// ボット検出のルール
		detectBot({
			mode: "LIVE", 
			allow: [
				"CATEGORY:SEARCH_ENGINE", // Googlebot, Bingbot など
				"CATEGORY:MONITOR", // UptimeRobot などの死活監視ツール
				"CATEGORY:PREVIEW", // Slack, Discord, X (旧Twitter) などのリンクプレビュー
			],
		}),
		// レート制限のアルゴリズムとしてトークンバケットを採用
		tokenBucket({
			mode: "LIVE",
			characteristics: ["ip.src"], // IPアドレスを追跡
			refillRate: 5, // 5個のトークンを補充
			interval: 10, // 10秒ごとに
			capacity: 10, // バケットには最大10個のトークンが含まれる
		}),
	],
});
