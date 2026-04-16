import { TextArea } from "@heroui/react";
import { DefaultAvatar } from "../avatar";
import { DefaultButton } from "../button";
import { BaseCard } from "../cards/base-card";

// Type definitions
interface Comment {
	id: string;
	userName: string;
	content: string;
	createdAt: Date;
}

interface CommentsCardProps {
	comments: Comment[];
	userData: {
		name?: string;
		image?: string;
	} | null;
	comment: string;
	onCommentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
	isTeacher?: boolean;
	dateOptionforAnnouncement?: Intl.DateTimeFormatOptions;
}

// CommentsCard component
export function CommentsCard({
	comments,
	userData,
	comment,
	onCommentChange,
	isTeacher = false,
	dateOptionforAnnouncement = {
		year: "numeric",
		month: "short",
		day: "numeric",
	},
}: CommentsCardProps) {
	return (
		<BaseCard className="border border-divider">
			<div className="p-6">
				<h2 className="mb-4 font-medium text-lg">コメント</h2>
				<div className="mb-6 flex items-center gap-3">
					<div className="flex-shrink-0">
						<DefaultAvatar userName={userData?.name} src={userData?.image} />
					</div>
					<div className="flex-1">
						<TextArea
							placeholder="コメントを入力"
							fullWidth
							value={comment}
							onChange={onCommentChange}
							variant="secondary"
						/>
					</div>
				</div>
				{comment.trim() && (
					<div className="mt-1 flex justify-end">
						<DefaultButton>コメントを追加</DefaultButton>
					</div>
				)}
				<div className="space-y-6">
					{comments.map((comment) => (
						<div key={comment.id} className="flex items-center gap-3">
							<div className="flex-shrink-0">
								<DefaultAvatar userName={comment.userName} />
							</div>
							<div>
								<div className="flex items-center gap-2">
									<p className="font-medium">{comment.userName}</p>
									<p className="text-default-500 text-xs">
										{comment.createdAt.toLocaleString(
											"default",
											dateOptionforAnnouncement,
										)}
									</p>
								</div>
								<p className="mt-1">{comment.content}</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</BaseCard>
	);
}
