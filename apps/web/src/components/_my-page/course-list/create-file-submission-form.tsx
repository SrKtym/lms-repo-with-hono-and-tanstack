import {
	FileUploaderCard,
	type UploadedFile,
} from "@lms-repo/ui/components/cards/file-uploader-card";
import { toast } from "@lms-repo/ui/components/toast";
import { useEffect, useState } from "react";
import {
	useDeleteFile,
	useDownloadUrl,
	useFileMetadata,
	useSubmitMultipleFiles,
} from "@/hooks/submissions";

export function CreateFileSubmissionForm({
	assignmentId,
}: {
	assignmentId: string;
}) {
	const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
	const { mutateAsync: submitMultipleFiles, isPending } =
		useSubmitMultipleFiles();
	const { data: fileMetadata } = useFileMetadata();
	const [downloadingFileId, setDownloadingFileId] = useState<string | null>(
		null,
	);
	const { data: downloadData } = useDownloadUrl(downloadingFileId || "");
	const { mutate: deleteFile } = useDeleteFile();

	// データベースから取得したアップロード済みファイルをコンポーネントの状態に変換
	useEffect(() => {
		if (fileMetadata) {
			const convertedFiles: UploadedFile[] = fileMetadata.map((meta) => ({
				id: meta.id,
				name: meta.originalName,
				size: meta.fileSize,
				type: meta.mimeType,
			}));
			setUploadedFiles(convertedFiles);
		}
	}, [fileMetadata]);

	// ダウンロードURLが取得できたらファイルをダウンロード
	useEffect(() => {
		if (downloadData && "signedUrl" in downloadData) {
			const link = document.createElement("a");
			link.href = downloadData.signedUrl;
			link.download = downloadData.fileName;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			setDownloadingFileId(null);
		}
	}, [downloadData]);

	// ファイルダウンロード時の処理
	const handleFileDownload = (fileId: string) => {
		setDownloadingFileId(fileId);
	};

	// ファイル削除時の処理
	const handleFileDelete = (fileId: string) => {
		deleteFile(fileId, {
			onSuccess: () => {
				toast.success("ファイルを削除しました");
				setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
			},
			onError: (error) => {
				toast.danger("ファイルの削除に失敗しました", {
					description: error.message,
				});
			},
		});
	};

	// ファイル選択時に新規ファイルをアップロード処理する
	const onFilesChange = async (files: UploadedFile[]) => {
		if (files.length === 0 || isPending) {
			return;
		}

		// 新規ファイルのみをフィルタリング
		const newFiles = files.filter(
			(file) => !uploadedFiles.some((f) => f.name === file.name),
		);

		if (newFiles.length === 0) {
			return;
		}

		// UploadedFileからFileオブジェクトを再構築
		const fileObjects = newFiles.map((file) => {
			return new File([file.name], file.name, { type: file.type });
		});

		try {
			// アップロード処理
			const res = await submitMultipleFiles({
				files: fileObjects,
				assignmentId,
			});

			if ("error" in res) {
				toast.danger("ファイルの提出に失敗しました", {
					description: res.error,
				});
			} else if ("message" in res) {
				toast.danger(res.message);
			} else {
				// アップロード完了したファイル名を記録
				setUploadedFiles((prev) => [...prev, ...newFiles]);
			}
		} catch {
			toast.danger("ファイルの提出に失敗しました", {
				description:
					"予期しないエラーが発生しました。お手数ですが再度試行してください。",
			});
		}
	};

	return (
		<div className="space-y-4">
			<FileUploaderCard
				uploadedFiles={uploadedFiles}
				onFilesChange={onFilesChange}
				onFileDownload={handleFileDownload}
				onFileDelete={handleFileDelete}
				disabled={isPending}
			/>
			{isPending && (
				<div className="text-center text-gray-600 dark:text-gray-400">
					アップロード中...
				</div>
			)}
		</div>
	);
}
