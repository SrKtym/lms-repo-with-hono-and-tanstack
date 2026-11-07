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
