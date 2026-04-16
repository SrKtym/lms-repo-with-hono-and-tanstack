import { Input } from "@heroui/react";
import { CloudUpload } from "@lms-repo/ui/assets/icons/cloud-upload";
import { AnimatePresence, domAnimation, LazyMotion } from "motion/react";
import * as m from "motion/react-m";
import { useCallback, useState } from "react";
import { CancelButton, DefaultButton } from "../button";
import { BaseCard } from "../cards/base-card";
import { DefaultProgressBar } from "../progress-bar";

export interface UploadedFile {
	id: string;
	name: string;
	size: number;
	type: string;
	url?: string;
	uploadProgress: number;
	status: "pending" | "uploading" | "success" | "error";
	error?: string;
}

interface FileUploaderCardProps {
	accept?: string;
	maxSize?: number; // in MB
	maxFiles?: number;
	onFilesChange?: (files: UploadedFile[]) => void;
	onFileUpload?: (file: File) => Promise<string>;
	disabled?: boolean;
	className?: string;
}

export function FileUploaderCard({
	accept = "*/*",
	maxSize = 10,
	maxFiles = 5,
	onFilesChange,
	onFileUpload,
	disabled = false,
	className = "",
}: FileUploaderCardProps) {
	const [files, setFiles] = useState<UploadedFile[]>([]);
	const [isDragOver, setIsDragOver] = useState(false);
	const [isUploading, setIsUploading] = useState(false);

	const formatFileSize = (bytes: number) => {
		if (bytes === 0) return "0 Bytes";
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return Number.parseFloat((bytes / k ** i).toFixed(2)) + " " + sizes[i];
	};

	const handleFileSelect = useCallback(
		(selectedFiles: FileList | null) => {
			if (!selectedFiles || disabled) return;

			const newFiles: UploadedFile[] = Array.from(selectedFiles)
				.slice(0, maxFiles - files.length)
				.map((file) => ({
					id: Math.random().toString(36).substr(2, 9),
					name: file.name,
					size: file.size,
					type: file.type,
					uploadProgress: 0,
					status: "pending" as const,
				}));

			setFiles((prev) => [...prev, ...newFiles]);
			onFilesChange?.([...files, ...newFiles]);
		},
		[files, maxFiles, disabled, onFilesChange],
	);

	const handleDragOver = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			if (!disabled) {
				setIsDragOver(true);
			}
		},
		[disabled],
	);

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(false);
	}, []);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			setIsDragOver(false);
			if (!disabled) {
				handleFileSelect(e.dataTransfer.files);
			}
		},
		[disabled, handleFileSelect],
	);

	const removeFile = useCallback(
		(id: string) => {
			const newFiles = files.filter((file) => file.id !== id);
			setFiles(newFiles);
			onFilesChange?.(newFiles);
		},
		[files, onFilesChange],
	);

	const uploadFiles = useCallback(async () => {
		if (!onFileUpload || isUploading) return;

		setIsUploading(true);

		// Update status to uploading
		const uploadingFiles = files.map((file) => ({
			...file,
			status: "uploading" as const,
		}));
		setFiles(uploadingFiles);

		// Simulate upload progress
		for (const file of uploadingFiles) {
			if (file.status !== "uploading") continue;

			try {
				// Simulate upload with progress
				for (let progress = 0; progress <= 100; progress += 10) {
					await new Promise((resolve) => setTimeout(resolve, 100));
					setFiles((prev) =>
						prev.map((f) =>
							f.id === file.id ? { ...f, uploadProgress: progress } : f,
						),
					);
				}

				// Get URL from upload function
				const url = await onFileUpload(
					new File([file.name], file.name, { type: file.type }),
				);

				// Update status to success
				setFiles((prev) =>
					prev.map((f) =>
						f.id === file.id ? { ...f, status: "success" as const, url } : f,
					),
				);
			} catch (error) {
				// Update status to error
				setFiles((prev) =>
					prev.map((f) =>
						f.id === file.id
							? {
									...f,
									status: "error" as const,
									error:
										error instanceof Error
											? error.message
											: "アップロードに失敗しました",
								}
							: f,
					),
				);
			}
		}

		setIsUploading(false);
	}, [files, onFileUpload, isUploading]);

	return (
		<LazyMotion features={domAnimation}>
			<m.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
				className={className}
			>
				<div
					className={`relative cursor-pointer rounded-lg border-2 border-dashed transition-colors ${
						isDragOver
							? "border-blue-500 bg-blue-50 dark:bg-blue-950"
							: "border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500"
					} ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
					onClick={() =>
						!disabled && document.getElementById("file-input")?.click()
					}
				>
					<BaseCard className="border-0">
						<Input
							id="file-input"
							type="file"
							multiple
							accept={accept}
							onChange={(e) => handleFileSelect(e.target.files)}
							disabled={disabled}
							className="hidden"
						/>
						<div className="p-8 text-center">
							<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
								<CloudUpload />
							</div>
							<p className="mb-2 font-medium text-gray-900 text-lg dark:text-gray-100">
								{isDragOver
									? "ここにファイルをドロップ"
									: "ファイルのアップロード"}
							</p>
							<p className="text-gray-600 text-sm dark:text-gray-400">
								クリックまたはドラッグしてファイルをアップロードしてください
							</p>
							<p className="text-gray-500 text-xs dark:text-gray-500">
								最大 {maxFiles} ファイルまで
							</p>
							{accept !== "*/*" && <p>サポートされている形式: {accept}</p>}
						</div>
					</BaseCard>
				</div>

				{/* File list */}
				<AnimatePresence>
					{files.length > 0 && (
						<m.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							transition={{ duration: 0.3 }}
							className="mt-4 space-y-2"
						>
							{files.map((file) => (
								<m.div
									key={file.id}
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: 20 }}
									className="flex items-center gap-3 rounded-lg border p-3 dark:border-gray-700"
								>
									<div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800" />
									<div className="min-w-0 flex-1">
										<p className="truncate font-medium text-gray-900 dark:text-gray-100">
											{file.name}
										</p>
										<p className="text-gray-600 text-sm dark:text-gray-400">
											{formatFileSize(file.size)}
										</p>
										{file.status === "uploading" && (
											<DefaultProgressBar
												value={file.uploadProgress}
												className="mt-1"
											/>
										)}
										{file.status === "error" && (
											<p className="text-red-600 text-sm dark:text-red-400">
												{file.error}
											</p>
										)}
									</div>
									<div className="flex items-center gap-2">
										{file.status === "success" && (
											<span className="text-green-600 dark:text-green-400">
												â
											</span>
										)}
										{file.status === "error" && (
											<span className="text-red-600 dark:text-red-400">â</span>
										)}
										<button
											onClick={() => removeFile(file.id)}
											className="rounded p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
										>
											×
										</button>
									</div>
								</m.div>
							))}
						</m.div>
					)}
				</AnimatePresence>

				{/* Actions */}
				{files.length > 0 && (
					<m.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3, delay: 0.1 }}
						className="mt-4 flex justify-end gap-2"
					>
						<CancelButton onClick={() => setFiles([])} isDisabled={isUploading}>
							すべて削除
						</CancelButton>
						<DefaultButton onClick={uploadFiles} isDisabled={isUploading}>
							{isUploading ? "Uploading..." : "Upload Files"}
						</DefaultButton>
					</m.div>
				)}
			</m.div>
		</LazyMotion>
	);
}
