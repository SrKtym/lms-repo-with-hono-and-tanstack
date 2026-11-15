// スケジュールビューのラベル
export const viewLabels = ["月", "週", "日"] as const;

// イベントが現在進行中であるかどうかを判定
export const isProgressingOrUpcoming = (start: Date, end: Date) => {
	const now = new Date();
	const isProgressing = start < now && end > now;
	const upcoming = now < start;

	if (isProgressing) {
		return "progressing";
	}
	if (upcoming) {
		return "upcoming";
	}
	return "past";
};

// 通知受信からの経過時間
export function formatTimestamp(date: Date) {
	const now = new Date();
	const diff = now.getTime() - date.getTime();
	const minutes = Math.floor(diff / (1000 * 60));
	const hours = Math.floor(diff / (1000 * 60 * 60));
	const days = Math.floor(diff / (1000 * 60 * 60 * 24));

	if (minutes < 1) {
		return "たった今";
	}
	if (minutes < 60) {
		return `${minutes}分前`;
	}
	if (hours < 24) {
		return `${hours}時間前`;
	}
	if (days < 7) {
		return `${days}日前`;
	}
	return date.toLocaleDateString("ja-JP", {
		month: "short",
		day: "numeric",
	});
}

// 同じ日かどうかを判定
export function isSameDay(date1: Date, date2: Date) {
	if (!date1 || !date2) {
		return false;
	}
	return (
		date1.getFullYear() === date2.getFullYear() &&
		date1.getMonth() === date2.getMonth() &&
		date1.getDate() === date2.getDate()
	);
}

// parseDates適用後の型（指定フィールドがDate型になる）
type WithParsedDates<T, K extends keyof T> = Omit<T, K> & {
	[P in K]: T[P] extends string | null | undefined
		? Date | Extract<T[P], null | undefined>
		: Date;
};

// オブジェクト内の指定したstring型フィールドをDate型に変換する
export function parseDates<
	T extends object,
	K extends Extract<keyof T, string>,
>(data: T, dateFields: readonly K[]): WithParsedDates<T, K> {
	const result = { ...(data as Record<string, unknown>) };
	for (const field of dateFields) {
		const value = data[field];
		if (typeof value === "string" && value !== "") {
			result[field] = new Date(value);
		}
	}
	return result as WithParsedDates<T, K>;
}

// 配列内の各オブジェクトにparseDatesを適用する
export function parseDatesInArray<
	T extends object,
	K extends Extract<keyof T, string>,
>(data: T[], dateFields: readonly K[]): WithParsedDates<T, K>[] {
	return data.map((item) => parseDates(item, dateFields));
}
