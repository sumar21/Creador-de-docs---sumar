import { nanoid } from "nanoid";
import { create } from "zustand";

import { features } from "@/config/features";
import type {
  AISuggestion,
  DocumentData,
  DocumentStatus,
  ProposalOption,
} from "@/lib/types/document";

export type SaveState = "saved" | "dirty" | "saving";

export interface BuilderPersistedState {
  documentData: DocumentData;
  docStatus: DocumentStatus;
  lastPublishedSlug?: string;
}

interface BuilderState {
  documentData: DocumentData;
  saveState: SaveState;
  docStatus: DocumentStatus;
  lastPublishedSlug?: string;
  setClientName: (name: string) => void;
  setClientLogo: (logoUrl?: string) => void;
  setDocType: (docType: DocumentData["docType"]) => void;
  updateProposal: (id: string, updates: Partial<ProposalOption>) => void;
  addProposal: (proposal?: Partial<ProposalOption>) => void;
  removeProposal: (id: string) => void;
  moveProposal: (id: string, direction: "up" | "down") => void;
  setMeetingNotes: (notes: string) => void;
  setAISuggestions: (suggestions: AISuggestion[]) => void;
  applySuggestion: (suggestionId: string) => void;
  clearAISuggestions: () => void;
  publishSuccess: (slug: string) => void;
  hydrate: (snapshot: BuilderPersistedState) => void;
  setSaveState: (saveState: SaveState) => void;
  getPersistedState: () => BuilderPersistedState;
}

function createDefaultProposal(index: number): ProposalOption {
  return {
    id: nanoid(),
    title: `Propuesta ${String.fromCharCode(65 + index)}`,
    currency: "ARS",
    total: 0,
    supportHourlyRate: 0,
    note: "",
  };
}

function initialDocumentData(): DocumentData {
  return {
    docType: "proposal",
    client: {
      name: "Cliente",
    },
    proposals: [createDefaultProposal(0)],
    meetingNotes: "",
    aiSuggestions: [],
  };
}

function withEditableUpdate(
  state: BuilderState,
  updater: (data: DocumentData) => DocumentData,
): Pick<BuilderState, "documentData" | "saveState" | "docStatus"> {
  return {
    documentData: updater(state.documentData),
    saveState: "dirty",
    docStatus: state.docStatus === "published" ? "draft" : state.docStatus,
  };
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  documentData: initialDocumentData(),
  saveState: "saved",
  docStatus: "draft",
  lastPublishedSlug: undefined,

  setClientName: (name) => {
    set((state) =>
      withEditableUpdate(state, (data) => ({
        ...data,
        client: {
          ...data.client,
          name,
        },
      })),
    );
  },

  setClientLogo: (logoUrl) => {
    set((state) =>
      withEditableUpdate(state, (data) => ({
        ...data,
        client: {
          ...data.client,
          logoUrl,
        },
      })),
    );
  },

  setDocType: (docType) => {
    set((state) =>
      withEditableUpdate(state, (data) => ({
        ...data,
        docType,
      })),
    );
  },

  updateProposal: (id, updates) => {
    set((state) =>
      withEditableUpdate(state, (data) => ({
        ...data,
        proposals: data.proposals.map((proposal) =>
          proposal.id === id
            ? {
                ...proposal,
                ...updates,
              }
            : proposal,
        ),
      })),
    );
  },

  addProposal: (proposal = {}) => {
    set((state) => {
      if (state.documentData.proposals.length >= features.maxProposals) {
        return state;
      }

      const nextIndex = state.documentData.proposals.length;
      const nextProposal: ProposalOption = {
        ...createDefaultProposal(nextIndex),
        ...proposal,
      };

      return withEditableUpdate(state, (data) => ({
        ...data,
        proposals: [...data.proposals, nextProposal],
      }));
    });
  },

  removeProposal: (id) => {
    set((state) => {
      if (state.documentData.proposals.length <= 1) {
        return state;
      }

      return withEditableUpdate(state, (data) => ({
        ...data,
        proposals: data.proposals.filter((proposal) => proposal.id !== id),
      }));
    });
  },

  moveProposal: (id, direction) => {
    set((state) => {
      const index = state.documentData.proposals.findIndex((proposal) => proposal.id === id);
      if (index === -1) {
        return state;
      }

      const swapIndex = direction === "up" ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= state.documentData.proposals.length) {
        return state;
      }

      return withEditableUpdate(state, (data) => {
        const proposals = [...data.proposals];
        const current = proposals[index];
        proposals[index] = proposals[swapIndex];
        proposals[swapIndex] = current;

        return {
          ...data,
          proposals,
        };
      });
    });
  },

  setMeetingNotes: (notes) => {
    set((state) =>
      withEditableUpdate(state, (data) => ({
        ...data,
        meetingNotes: notes,
      })),
    );
  },

  setAISuggestions: (suggestions) => {
    set((state) =>
      withEditableUpdate(state, (data) => ({
        ...data,
        aiSuggestions: suggestions,
      })),
    );
  },

  applySuggestion: (suggestionId) => {
    set((state) => {
      const suggestions = state.documentData.aiSuggestions ?? [];
      const suggestion = suggestions.find((item) => item.id === suggestionId);

      if (!suggestion) {
        return state;
      }

      if (suggestion.type === "add_proposal") {
        if (state.documentData.proposals.length >= features.maxProposals) {
          return withEditableUpdate(state, (data) => ({
            ...data,
            aiSuggestions: suggestions.filter((item) => item.id !== suggestionId),
          }));
        }

        const payloadTitle = typeof suggestion.payload.title === "string" ? suggestion.payload.title : "Nueva propuesta";
        const payloadCurrency = suggestion.payload.currency === "USD" ? "USD" : "ARS";

        return withEditableUpdate(state, (data) => ({
          ...data,
          proposals: [
            ...data.proposals,
            {
              id: nanoid(),
              title: payloadTitle,
              currency: payloadCurrency,
              total: 0,
              supportHourlyRate: 0,
              note: "",
            },
          ],
          aiSuggestions: suggestions.filter((item) => item.id !== suggestionId),
        }));
      }

      return withEditableUpdate(state, (data) => ({
        ...data,
        aiSuggestions: suggestions.filter((item) => item.id !== suggestionId),
      }));
    });
  },

  clearAISuggestions: () => {
    set((state) =>
      withEditableUpdate(state, (data) => ({
        ...data,
        aiSuggestions: [],
      })),
    );
  },

  publishSuccess: (slug) => {
    set((state) => ({
      ...state,
      docStatus: "published",
      lastPublishedSlug: slug,
      saveState: "saved",
    }));
  },

  hydrate: (snapshot) => {
    set((state) => ({
      ...state,
      documentData: snapshot.documentData,
      docStatus: snapshot.docStatus,
      lastPublishedSlug: snapshot.lastPublishedSlug,
      saveState: "saved",
    }));
  },

  setSaveState: (saveState) => {
    set((state) => ({
      ...state,
      saveState,
    }));
  },

  getPersistedState: () => ({
    documentData: get().documentData,
    docStatus: get().docStatus,
    lastPublishedSlug: get().lastPublishedSlug,
  }),
}));
