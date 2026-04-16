import { Avatar } from "@heroui/react";

// 汎用アバターコンポーネント
export function DefaultAvatar({
	src,
	userName,
}: {
	src?: string | null;
	userName?: string;
}) {
	return (
		<Avatar size="md">
			<Avatar.Image src={src || undefined} alt={userName} />
			<Avatar.Fallback>{userName?.at(0)}</Avatar.Fallback>
		</Avatar>
	);
}
