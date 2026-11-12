type DateTimeFormatConfigKey =
	| "DEFAULT"
	| "FULL_DATE"
	| "DIGIT_TIME"
	| "FULL_DATETIME";

type DateTimeFormatConfig = {
	options: Intl.DateTimeFormatOptions;
	defaultLocale: string;
};

// 日時フォーマット設定
export const DATETIME_FORMAT_CONFIG: Record<
	DateTimeFormatConfigKey,
	DateTimeFormatConfig
> = {
	DEFAULT: {
		options: {
			year: "numeric",
			month: "short",
			day: "numeric",
		},
		defaultLocale: "ja-JP",
	},
	FULL_DATE: {
		options: {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		},
		defaultLocale: "ja-JP",
	},
	DIGIT_TIME: {
		options: {
			hour: "2-digit",
			minute: "2-digit",
		},
		defaultLocale: "ja-JP",
	},
	FULL_DATETIME: {
		options: {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		},
		defaultLocale: "ja-JP",
	},
};

// 編集期限（2週間）
export const EDIT_PERIOD_DAYS = 14;

// 曜日の配列
export const DAYS = ["日", "月", "火", "水", "木", "金", "土"] as const;

// 土曜日と日曜日を除外
export const DAYS_EXCEPT_WEEKEND = DAYS.filter(
	(day) => day !== "土" && day !== "日",
);
