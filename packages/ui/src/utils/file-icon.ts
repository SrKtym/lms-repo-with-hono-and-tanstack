import { FileText } from "../assets/icons/file-text";
import { MSExcel } from "../assets/icons/ms-excel";
import { MSPowerpoint } from "../assets/icons/ms-powerpoint";
import { MSword } from "../assets/icons/ms-word";
import { PDFFile } from "../assets/icons/pdf-file";

// ファイルの形式に基づくアイコン
export function getIconByFormat(format?: string) {
	switch (format) {
		case "pdf":
			return PDFFile;
		case "word":
			return MSword;
		case "excel":
			return MSExcel;
		case "powerpoint":
			return MSPowerpoint;
		default:
			return FileText;
	}
}
