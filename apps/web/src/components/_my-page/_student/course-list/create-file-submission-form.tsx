import {
	FileUploaderCard,
	type UploadedFile,
} from "@lms-repo/ui/components/cards/file-uploader-card";
import { Loader } from "@lms-repo/ui/components/loader";
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
	const { data: fileMetadata = [] } = useFileMetadata(assignmentId);
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
			onSuccess: (data) => {
				if ("error" in data) {
					toast.danger(data.error);
				}
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

		// 新規ファイルのみをフィルタリング（tempIDで識別）
		const newFiles = files.filter(
			(file) =>
				file.id.startsWith("temp-") &&
				!uploadedFiles.some((f) => f.name === file.name),
		);

		if (newFiles.length === 0) {
			return;
		}

		// 一時ファイルを先に追加（ローディング表示用）
		setUploadedFiles((prev) => [...prev, ...newFiles]);

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
				// アップロード失敗時は一時ファイルを削除
				setUploadedFiles((prev) =>
					prev.filter((f) => !newFiles.some((nf) => nf.id === f.id)),
				);
			} else if ("results" in res) {
				// 成功したファイルのみをフィルタリング
				const successfulResults = res.results.filter(
					(result) => result !== null && "id" in result,
				);

				// tempIDをサーバーIDで置換
				const tempToServerIdMap = new Map<string, string>();
				successfulResults.forEach((serverFile, index) => {
					const tempId = newFiles[index]?.id;
					if (tempId) {
						tempToServerIdMap.set(tempId, serverFile.id);
					}
				});

				setUploadedFiles((prev) =>
					prev.map((file) => {
						const serverId = tempToServerIdMap.get(file.id);
						if (serverId) {
							const serverFile = successfulResults.find(
								(sf) => sf.id === serverId,
							);
							if (serverFile) {
								return {
									id: serverFile.id,
									name: serverFile.originalName,
									size: serverFile.fileSize,
									type: serverFile.mimeType,
								};
							}
						}
						return file;
					}),
				);
			}
		} catch {
			toast.danger("ファイルの提出に失敗しました", {
				description:
					"予期しないエラーが発生しました。お手数ですが再度試行してください。",
			});
			// エラー時は一時ファイルを削除
			setUploadedFiles((prev) =>
				prev.filter((f) => !newFiles.some((nf) => nf.id === f.id)),
			);
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
			{isPending && <Loader text="アップロード中..." />}
		</div>
	);
}
