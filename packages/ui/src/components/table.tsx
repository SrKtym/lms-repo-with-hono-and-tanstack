import type { Selection } from "@heroui/react";
import { Button, Table } from "@heroui/react";
import type { FetchAllSubmissionsWithStudentsReturnType } from "@lms-repo/db/utils/query/submissions";
import { ArrowRight } from "@lms-repo/ui/assets/icons/arrow-right";
import type React from "react";
import { useState } from "react";
import { CancelButton, DefaultButton } from "./button";
import { DefaultChip } from "./chip";
import { DefaultInput } from "./input";

interface SubmissionsTableProps {
	submissions: FetchAllSubmissionsWithStudentsReturnType;
	onViewTextSubmission?: (submissionId: string) => void;
	onDownloadFile?: (fileId: string) => void;
	onGrade?: (userId: string, assignmentId: string, score: number) => void;
	children: React.ReactNode;
}

type SubmissionRow = {
	children: {
		id: string;
		originalName: string;
		mimeType: string;
		fileSize: number;
	}[];
	rest: Omit<
		FetchAllSubmissionsWithStudentsReturnType[number],
		"fileSubmission"
	>;
};

// 提出物テーブルコンポーネント
export function SubmissionsTable({
	submissions,
	onViewTextSubmission,
	onDownloadFile,
	onGrade,
	children,
}: SubmissionsTableProps) {
	const [expandedKeys, setExpandedKeys] = useState<Selection>(() => new Set());
	const [gradingRowId, setGradingRowId] = useState<string | null>(null);
	const [tempScore, setTempScore] = useState<string>("");

	// 採点モードに切り替え
	const handleStartGrading = (rowId: string, currentScore: number | null) => {
		setGradingRowId(rowId);
		setTempScore(currentScore !== null ? String(currentScore) : "");
	};

	// 採点の中止
	const handleCancelGrading = () => {
		setGradingRowId(null);
		setTempScore("");
	};

	// 採点の送信
	const handleSubmitGrading = (item: SubmissionRow) => {
		const score = Number.parseInt(tempScore, 10);
		if (!Number.isNaN(score) && onGrade) {
			onGrade(item.rest.userId, item.rest.assignmentId, score);
		}
		setGradingRowId(null);
		setTempScore("");
	};

	// データ変換: FetchAllSubmissionsWithStudentsReturnType -> SubmissionRow[]
	const data: SubmissionRow[] = submissions.map((submission) => ({
		rest: submission,
		children: submission.fileSubmission,
	}));

	const renderExpandableRow = (item: SubmissionRow) => {
		return (
			<Table.Row id={item.rest.studentName} textValue={item.rest.studentName}>
				<Table.Cell textValue={item.rest.studentName}>
					{({ hasChildItems, isDisabled, isExpanded, isTreeColumn }) => (
						<span className="flex items-center gap-1">
							{hasChildItems && isTreeColumn ? (
								<Button
									isIconOnly
									aria-label="Toggle row"
									isDisabled={isDisabled}
									size="sm"
									slot="chevron"
									variant="ghost"
								>
									<ArrowRight
										className={`size-4 text-muted transition-transform duration-150 ${isExpanded ? "rotate-90" : "rtl:rotate-180"}`}
									/>
								</Button>
							) : null}
							<span>{item.rest.studentName}</span>
						</span>
					)}
				</Table.Cell>
				<Table.Cell>
					{Object.keys(item.rest.textSubmission).length > 0 ? (
						<button
							type="button"
							onClick={() =>
								onViewTextSubmission?.(item.rest.textSubmission.id)
							}
							className="cursor-pointer text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
						>
							テキストを確認
						</button>
					) : (
						<span className="text-gray-500 dark:text-gray-400">
							{item.rest.assignmentFormat}
						</span>
					)}
				</Table.Cell>
				<Table.Cell>{item.rest.status}</Table.Cell>
				<Table.Cell>
					{gradingRowId === item.rest.studentName ? (
						// アクティブ状態: 採点入力モード
						<div className="flex items-center gap-2">
							<div className="max-w-md">
								<DefaultInput
									type="number"
									value={tempScore}
									onChange={(e) => setTempScore(e.target.value)}
									min={0}
									max={item.rest.points}
									step={1}
									className="w-18"
								/>
							</div>
							<DefaultButton
								size="sm"
								type="button"
								onPress={() => handleSubmitGrading(item)}
							>
								保存
							</DefaultButton>
							<CancelButton
								size="sm"
								type="button"
								onPress={handleCancelGrading}
							>
								キャンセル
							</CancelButton>
						</div>
					) : (
						// 非アクティブ状態: スコア表示
						<button
							type="button"
							className="cursor-pointer hover:underline"
							onClick={() =>
								handleStartGrading(item.rest.studentName, item.rest.score)
							}
						>
							{item.rest.score ? (
								<DefaultChip size="sm" color="success">
									{item.rest.score} 点
								</DefaultChip>
							) : (
								<span className="text-gray-500 dark:text-gray-400">
									{item.rest.status !== "評定済み" && "未採点"}
								</span>
							)}
						</button>
					)}
				</Table.Cell>
				{item.children.length > 0 && (
					<Table.Collection items={item.children}>
						{(file) => (
							<Table.Row id={file.id} textValue={file.originalName}>
								<Table.Cell textValue={file.originalName}>
									<button
										type="button"
										onClick={() => onDownloadFile?.(file.id)}
										className="cursor-pointer text-green-600 hover:text-green-700 hover:underline dark:text-green-400 dark:hover:text-green-300"
									>
										{file.originalName}
									</button>
								</Table.Cell>
								<Table.Cell>{file.mimeType}</Table.Cell>
								<Table.Cell>
									<span className="text-gray-500 dark:text-gray-400">-</span>
								</Table.Cell>
								<Table.Cell>
									<span className="text-gray-500 dark:text-gray-400">-</span>
								</Table.Cell>
							</Table.Row>
						)}
					</Table.Collection>
				)}
			</Table.Row>
		);
	};

	return (
		<Table variant="secondary">
			<Table.ScrollContainer className="h-[420px] overflow-y-auto">
				<Table.Content
					aria-label="Submissions"
					expandedKeys={expandedKeys}
					treeColumn="studentName"
					onExpandedChange={setExpandedKeys}
				>
					<Table.Header>
						<Table.Column isRowHeader id="studentName">
							受講者名
						</Table.Column>
						<Table.Column id="submission">提出物</Table.Column>
						<Table.Column id="status">ステータス</Table.Column>
						<Table.Column id="score">点数</Table.Column>
					</Table.Header>
					<Table.Body items={data}>{renderExpandableRow}</Table.Body>
				</Table.Content>
				{children}
			</Table.ScrollContainer>
		</Table>
	);
}
