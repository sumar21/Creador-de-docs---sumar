import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

export const MAX_NOTES_FILE_SIZE_BYTES = 12 * 1024 * 1024;

const SUPPORTED_EXTENSIONS = new Set(["pdf", "docx"]);
const SUPPORTED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
]);

export type SupportedNotesFileExtension = "pdf" | "docx";

export interface NotesFileValidationResult {
  extension: SupportedNotesFileExtension;
  mimeType: string;
}

export class NotesFileError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "NotesFileError";
    this.status = status;
  }
}

function getFileExtension(fileName: string): string {
  const match = /\.([a-zA-Z0-9]+)$/.exec(fileName);
  return match?.[1]?.toLowerCase() ?? "";
}

function isSupportedMimeType(mimeType: string): boolean {
  if (!mimeType) {
    return true;
  }

  return SUPPORTED_MIME_TYPES.has(mimeType);
}

export function validateNotesFile(file: File): NotesFileValidationResult {
  const extension = getFileExtension(file.name);

  if (!SUPPORTED_EXTENSIONS.has(extension)) {
    throw new NotesFileError("Formato inválido. Subí un archivo PDF o DOCX.", 400);
  }

  if (!isSupportedMimeType(file.type)) {
    throw new NotesFileError("Tipo de archivo inválido. Subí un PDF o DOCX válido.", 400);
  }

  if (file.size > MAX_NOTES_FILE_SIZE_BYTES) {
    throw new NotesFileError("El archivo excede 12MB. Subí uno más liviano.", 400);
  }

  return {
    extension: extension as SupportedNotesFileExtension,
    mimeType: file.type,
  };
}

async function extractFromPdf(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.text ?? "";
  } finally {
    await parser.destroy();
  }
}

async function extractFromDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value ?? "";
}

export async function extractTextFromNotesFile(
  file: File,
  extension: SupportedNotesFileExtension,
): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (extension === "pdf") {
    return extractFromPdf(buffer);
  }

  return extractFromDocx(buffer);
}
