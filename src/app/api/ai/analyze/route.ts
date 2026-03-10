import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
const GEMINI_MODEL = "gemini-2.5-flash";

const SYSTEM_PROMPT = `Sos un asistente experto en marketing y gestión de clientes para la agencia Sumar.
Analizás el brief o notas de reunión de un cliente y generás sugerencias concretas para armar la propuesta comercial.

Tu respuesta DEBE ser un JSON válido con este formato exacto, sin texto extra ni markdown:
{
  "suggestions": [
    {
      "type": "add_proposal" | "add_block",
      "title": "Título corto y claro (max 60 chars)",
      "description": "Descripción de una o dos oraciones explicando por qué se recomienda (max 200 chars)",
      "payload": {
        "title": "Nombre de la propuesta (solo para type add_proposal)",
        "currency": "ARS" | "USD" (solo para type add_proposal),
        "blockType": "timeline" | "scope" | "team" | "process" (solo para type add_block)
      }
    }
  ]
}

Reglas:
- Generá entre 1 y 4 sugerencias relevantes basadas en las notas.
- Solo incluí sugerencias que realmente aporten valor al brief analizado.
- Si el brief menciona soporte, mantenimiento o postventa → sugerí una propuesta de soporte.
- Si el brief menciona ads, performance, campañas o leads → sugerí una propuesta de pauta (en USD).
- Si el brief menciona plazos, fechas o roadmap → sugerí un bloque de timeline.
- Si el brief menciona entregables, alcance o requerimientos → sugerí un bloque de scope.
- Respondé SIEMPRE en español.
- Solo respondé con el JSON, sin explicaciones adicionales.`;

function buildUserPrompt(notes: string): string {
  return `Analizá estas notas de reunión/brief del cliente y generá sugerencias:\n\n${notes.trim()}`;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "La integración con IA no está configurada. Agregá GEMINI_API_KEY al entorno." },
      { status: 503 },
    );
  }

  try {
    const body = (await request.json()) as { notes?: unknown };

    if (typeof body.notes !== "string" || !body.notes.trim()) {
      return NextResponse.json(
        { error: "Las notas no pueden estar vacías." },
        { status: 400 },
      );
    }

    const notes = body.notes.trim();

    if (notes.length > 8000) {
      return NextResponse.json(
        { error: "Las notas son demasiado largas. El máximo es 8000 caracteres." },
        { status: 400 },
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      systemInstruction: SYSTEM_PROMPT,
    });

    const result = await model.generateContent(buildUserPrompt(notes));
    const rawText = result.response.text().trim();

    // Limpiar posible markdown (```json ... ```)
    const jsonText = rawText
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    const parsed = JSON.parse(jsonText) as {
      suggestions?: Array<{
        type: string;
        title: string;
        description: string;
        payload: Record<string, unknown>;
      }>;
    };

    if (!Array.isArray(parsed.suggestions)) {
      throw new Error("Respuesta de IA inválida: no se encontró el campo 'suggestions'.");
    }

    return NextResponse.json({ suggestions: parsed.suggestions }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo analizar con IA.";

    if (message.includes("API key")) {
      return NextResponse.json(
        { error: "La API Key de Gemini es inválida o venció." },
        { status: 401 },
      );
    }

    if (message.includes("quota") || message.includes("rate")) {
      return NextResponse.json(
        { error: "Se alcanzó el límite de uso de la IA. Esperá un momento e intentá de nuevo." },
        { status: 429 },
      );
    }

    return NextResponse.json(
      { error: `Error al procesar con IA: ${message}` },
      { status: 500 },
    );
  }
}
