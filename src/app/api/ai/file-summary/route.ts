import { NextRequest, NextResponse } from "next/server";

  import { GoogleGenerativeAI } from "@google/generative-ai";
  import {
    extractTextFromNotesFile,
    NotesFileError,
    validateNotesFile,
  } from "@/lib/server/extract-document-text";
  
  const GEMINI_MODEL = "gemini-2.5-flash";
  
  const SYSTEM_PROMPT = `Sos un asistente especializado en ventas y propuestas comerciales para agencias
de marketing digital y tecnología en Argentina.

Tu tarea es analizar notas de reunión o documentos adjuntos del cliente y
extraer la información más relevante para construir una propuesta comercial
efectiva.

Respondé siempre en español rioplatense (vos, ustedes).
Respondé ÚNICAMENTE con un JSON válido y bien formado. Sin texto antes ni después.`;
  
  function buildUserPrompt(extractedText: string): string {
    return `Analizá el siguiente contenido extraído de un archivo (notas de reunión o documento del cliente):

---
${extractedText}
---

Retorná un JSON con esta estructura exacta:

{
  "summary": string,
  "suggestions": Suggestion[]
}

Donde:

- "summary": resumen en formato bullets. Usá "\\n- " para separar cada punto.
  Máximo 6 puntos. Enfocate en: qué necesita el cliente, qué servicios mencionó,
  fechas clave, presupuesto estimado, y cualquier señal de compra.

- "suggestions": array de hasta 4 sugerencias accionables para enriquecer
  la propuesta comercial. Cada sugerencia tiene esta forma:

  {
    "type": "add_proposal" | "add_block",
    "title": string,          // título corto, máximo 6 palabras
    "description": string,    // explicación concisa de por qué se sugiere
    "payload": object         // ver reglas abajo
  }

  Reglas para el campo "payload" según el tipo:

  - Si type === "add_proposal":
    payload = { "title": "<nombre de la propuesta>", "currency": "ARS" | "USD" }
    Usá USD para servicios de pauta, ads, performance o facturación en dólares.
    Usá ARS para servicios locales, soporte, desarrollo o mantenimiento.

  - Si type === "add_block":
    payload = { "blockType": "timeline" | "scope" | "team" | "pricing" }

Criterios para generar sugerencias:
- Si el cliente mencionó fechas, plazos o hitos → sugerí un bloque "timeline"
- Si hay requerimientos técnicos extensos o entregables → sugerí un bloque "scope"
- Si mencionaron soporte, mantenimiento o postventa → sugerí una propuesta ARS de soporte
- Si mencionaron pauta digital, campañas, leads o performance → sugerí una propuesta USD
- Si hay múltiples servicios o módulos distintos → sugerí propuestas separadas por servicio
- Si mencionaron equipo propio o colaboración → sugerí un bloque "team"

Si el texto es muy escueto o no tiene suficiente información, igualmente generá
al menos 1 sugerencia genérica útil para el contexto comercial.

Ejemplo de output esperado
{
  "summary": "Resumen del documento importado:\\n\\nPuntos clave:\\n- El cliente necesita un rediseño de e-commerce con integración a MercadoPago\\n- Mencionó lanzamiento para antes de octubre, con deadline inamovible\\n- Presupuesto estimado entre $8.000 y $10.000 USD\\n- Requieren soporte post-lanzamiento de al menos 3 meses\\n- Ya tienen contenido listo, solo necesitan implementación\\n- Están evaluando 2 proveedores en paralelo",
  "suggestions": [
    {
      "type": "add_proposal",
      "title": "Propuesta de desarrollo e-commerce",
      "description": "El cliente describió un proyecto concreto de e-commerce. Agregá una propuesta con el alcance de desarrollo.",
      "payload": { "title": "Desarrollo e-commerce", "currency": "USD" }
    },
    {
      "type": "add_proposal",
      "title": "Propuesta de soporte post-lanzamiento",
      "description": "Mencionaron necesidad de soporte por 3 meses. Podés incluir una propuesta separada de mantenimiento mensual.",
      "payload": { "title": "Soporte mensual", "currency": "ARS" }
    },
    {
      "type": "add_block",
      "title": "Bloque sugerido: Timeline",
      "description": "Hay una fecha límite clara. Incluir un timeline en la propuesta refuerza la confianza del cliente.",
      "payload": { "blockType": "timeline" }
    },
    {
      "type": "add_block",
      "title": "Bloque sugerido: Alcance",
      "description": "Los requerimientos mencionados (integración, diseño, contenido) ameritan dejar el alcance por escrito.",
      "payload": { "blockType": "scope" }
    }
  ]
}`;
  }
  
  export async function POST(request: NextRequest) {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { error: "La integración con IA no está configurada. Agregá GEMINI_API_KEY al entorno." },
          { status: 503 },
        );
      }
  
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
  
      // Limpiar un poco el texto para no enviar basura en exceso (saltos extra, espacios)
      const cleanText = extractedRawText.replace(/\s+/g, " ").trim();
  
      if (!cleanText) {
        return NextResponse.json(
          {
            error: "No se pudo extraer texto del archivo. Revisá que no sea un documento escaneado.",
          },
          { status: 422 },
        );
      }
  
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: GEMINI_MODEL,
        systemInstruction: SYSTEM_PROMPT,
      });
  
      const result = await model.generateContent(buildUserPrompt(cleanText.slice(0, 100000)));
      const rawText = result.response.text().trim();
      
      const jsonText = rawText
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/, "")
        .trim();
        
      const parsed = JSON.parse(jsonText);
  
      return NextResponse.json(
        {
          fileName: fileInput.name,
          extractedCharacterCount: cleanText.length,
          summary: parsed.summary,
          suggestions: parsed.suggestions ?? [],
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
