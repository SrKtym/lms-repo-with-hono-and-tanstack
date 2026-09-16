import { describe, expect, it } from "bun:test";
import { formatTimestamp, isProgressingOrUpcoming } from "./utils";

describe("formatTimestamp", () => {
	it("たった今（1分未満）", () => {
		const now = new Date();
		const oneSecondAgo = new Date(now.getTime() - 1000);
		expect(formatTimestamp(oneSecondAgo)).toBe("たった今");
	});

	it("分前（1分以上60分未満）", () => {
		const now = new Date();
		const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
		expect(formatTimestamp(fiveMinutesAgo)).toBe("5分前");
	});

	it("時間前（1時間以上24時間未満）", () => {
		const now = new Date();
		const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
		expect(formatTimestamp(threeHoursAgo)).toBe("3時間前");
	});

	it("日前（1日以上7日未満）", () => {
		const now = new Date();
		const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
		expect(formatTimestamp(twoDaysAgo)).toBe("2日前");
	});

	it("7日以上前は日付フォーマット", () => {
		const now = new Date();
		const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
		const result = formatTimestamp(tenDaysAgo);
		// 日付フォーマットが含まれていることを確認
		expect(result).toMatch(/\d{1,2}月\d{1,2}日/);
	});
});

describe("isProgressingOrUpcoming", () => {
	it("進行中のイベント", () => {
		const now = new Date();
		const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
		const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
		expect(isProgressingOrUpcoming(oneHourAgo, oneHourLater)).toBe(
			"progressing",
		);
	});

	it("今後のイベント", () => {
		const now = new Date();
		const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
		const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
		expect(isProgressingOrUpcoming(oneHourLater, twoHoursLater)).toBe(
			"upcoming",
		);
	});

	it("過去のイベント", () => {
		const now = new Date();
		const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
		const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
		expect(isProgressingOrUpcoming(twoHoursAgo, oneHourAgo)).toBe("past");
	});

	it("開始時刻が現在時刻より少し前の場合", () => {
		const now = new Date();
		const oneSecondAgo = new Date(now.getTime() - 1000);
		const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
		expect(isProgressingOrUpcoming(oneSecondAgo, oneHourLater)).toBe(
			"progressing",
		);
	});

	it("終了時刻と現在時刻が同じ場合", () => {
		const now = new Date();
		const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
		expect(isProgressingOrUpcoming(oneHourAgo, now)).toBe("past");
	});
});
