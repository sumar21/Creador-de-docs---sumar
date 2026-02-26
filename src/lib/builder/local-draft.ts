import { persistedDraftSchema } from "@/lib/validation/document";
import type { PersistedDraftPayload } from "@/lib/validation/document";

export const LOCAL_DRAFT_KEY = "sumar-proposal-builder-draft-v1";

export function loadDraft(): PersistedDraftPayload | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(LOCAL_DRAFT_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    const validated = persistedDraftSchema.safeParse(parsed);

    if (!validated.success) {
      return null;
    }

    return validated.data;
  } catch {
    return null;
  }
}

export function saveDraft(payload: PersistedDraftPayload): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(LOCAL_DRAFT_KEY, JSON.stringify(payload));
}
