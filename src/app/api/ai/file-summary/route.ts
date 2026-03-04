import { NextRequest, NextResponse } from "next/server";

import { normalizeExtractedText, summarizeExtractedText } from "@/lib/ai/extractive-summary";
import {
  extractTextFromNotesFile,
  NotesFileError,
  validateNotesFile,
} from "@/lib/server/extract-document-text";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const fileInput = formData.get("file");

    if (!(fileInput instanceof File)) {
      return NextResponse.json(
        {
          error: "No se recibió ningún archivo.",
        },
        { status: 400 },
      );
    }

    const { extension } = validateNotesFile(fileInput);
    const extractedRawText = await extractTextFromNotesFile(fileInput, extension);
    const extractedText = normalizeExtractedText(extractedRawText);

    if (!extractedText) {
      return NextResponse.json(
        {
          error: "No se pudo extraer texto del archivo. Revisá que no sea un documento escaneado.",
        },
        { status: 422 },
      );
    }

    const summary = summarizeExtractedText(extractedText);

    return NextResponse.json(
      {
        fileName: fileInput.name,
        extractedCharacterCount: extractedText.length,
        summary,
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof NotesFileError) {
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: error.status },
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "No se pudo procesar el archivo.",
      },
      { status: 500 },
    );
  }
}
