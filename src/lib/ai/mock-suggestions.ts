import { nanoid } from "nanoid";

import { features } from "@/config/features";
import type { AISuggestion } from "@/lib/types/document";

const KEYWORD_RULES: Array<{
  pattern: RegExp;
  suggestion: Omit<AISuggestion, "id">;
}> = [
  {
    pattern: /(soporte|mantenimiento|postventa)/i,
    suggestion: {
      type: "add_proposal",
      title: "Agregar propuesta de soporte",
      description:
        "Se detectaron necesidades de soporte continuo. Podrías sumar una propuesta dedicada de soporte mensual.",
      payload: {
        title: "Soporte mensual",
        currency: "ARS",
      },
    },
  },
  {
    pattern: /(ads|performance|leads|campana|campaña)/i,
    suggestion: {
      type: "add_proposal",
      title: "Agregar propuesta de pauta",
      description:
        "Parece haber foco en adquisición. Sumá una propuesta específica de pauta/performance.",
      payload: {
        title: "Performance y pauta",
        currency: "USD",
      },
    },
  },
  {
    pattern: /(timeline|plazo|deadline|fechas|roadmap)/i,
    suggestion: {
      type: "add_block",
      title: "Bloque sugerido: Timeline",
      description:
        "Las notas mencionan tiempos. Recomendación: incluir un bloque de timeline en la propuesta final.",
      payload: {
        blockType: "timeline",
      },
    },
  },
  {
    pattern: /(alcance|scope|entregable|entregables)/i,
    suggestion: {
      type: "add_block",
      title: "Bloque sugerido: Alcance",
      description:
        "Se detectaron requerimientos de alcance. Recomendación: incluir un bloque de alcance sugerido.",
      payload: {
        blockType: "scope",
      },
    },
  },
];

export function getMockSuggestionsFromNotes(notes: string): AISuggestion[] {
  const normalizedNotes = notes.trim();

  if (!normalizedNotes) {
    return [];
  }

  const suggestions: AISuggestion[] = [];

  for (const rule of KEYWORD_RULES) {
    if (!rule.pattern.test(normalizedNotes)) {
      continue;
    }

    if (rule.suggestion.type === "add_block" && !features.enableAIBlockRecommendations) {
      continue;
    }

    suggestions.push({
      ...rule.suggestion,
      id: nanoid(),
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      id: nanoid(),
      type: "add_proposal",
      title: "Agregar propuesta complementaria",
      description:
        "Como siguiente paso, podés sumar una propuesta alternativa para comparar alcance y presupuesto.",
      payload: {
        title: "Propuesta complementaria",
        currency: "ARS",
      },
    });
  }

  return suggestions.slice(0, 4);
}
