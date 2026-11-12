import { CalendarClock } from "@lms-repo/ui/assets/icons/calendar-clock";
import { DashBoard } from "@lms-repo/ui/assets/icons/dashboard";
import { List } from "@lms-repo/ui/assets/icons/list";
import { MessagesSquare } from "@lms-repo/ui/assets/icons/messages-square";
import { SquarePlus } from "@lms-repo/ui/assets/icons/square-plus";

// Linkコンポーネントのprops型
export interface LinkComponentProps {
	to: string;
	children: React.ReactNode;
}

// 学生用ヘッダーのリンク（width, heightはアイコンのサイズ）
export function getHeaderLinks(width: number, height: number) {
	return [
		{
			icon: DashBoard({ width, height }),
			to: "/dashboard",
			label: "ダッシュボード",
		},
		{
			icon: SquarePlus({ width, height }),
			to: "/register-courses",
			label: "履修登録",
		},
		{
			icon: List({ width, height }),
			to: "/my-courses",
			label: "履修一覧",
		},
		{
			icon: CalendarClock({ width, height }),
			to: "/schedules",
			label: "スケジュール",
		},
		{
			icon: MessagesSquare({ width, height }),
			to: "/notifications",
			label: "通知",
		},
	] as const;
}
