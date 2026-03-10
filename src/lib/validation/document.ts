import { z } from "zod";

export const proposalOptionSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1).max(120),
  currency: z.enum(["ARS", "USD"]),
  total: z.number().finite().nonnegative(),
  supportHourlyRate: z.number().finite().nonnegative().optional(),
  note: z.string().trim().max(240).optional(),
});

export const draftProposalOptionSchema = z.object({
  id: z.string().min(1),
  title: z.string().max(120),
  currency: z.enum(["ARS", "USD"]),
  total: z.number().finite().nonnegative(),
  supportHourlyRate: z.number().finite().nonnegative().optional(),
  note: z.string().max(240).optional(),
});

export const aiSuggestionSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["add_proposal", "add_block"]),
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(320),
  payload: z.record(z.string(), z.unknown()),
});

export const draftDocumentDataSchema = z.object({
  docType: z.enum(["proposal", "manual"]),
  client: z.object({
    name: z.string().trim().max(140),
    logoUrl: z.string().url().or(z.string().startsWith("data:image/")).optional(),
  }),
  proposals: z.array(draftProposalOptionSchema).min(1).max(3),
  meetingNotes: z.string().max(5000).optional(),
  aiSuggestions: z.array(aiSuggestionSchema).optional(),
});

export const documentDataSchema = z.object({
  docType: z.enum(["proposal", "manual"]),
  client: z.object({
    name: z.string().trim().min(1).max(140),
    logoUrl: z.string().url().or(z.string().startsWith("data:image/")).optional(),
  }),
  proposals: z.array(proposalOptionSchema).min(1).max(3),
  meetingNotes: z.string().max(5000).optional(),
  aiSuggestions: z.array(aiSuggestionSchema).optional(),
});

export const publishPayloadSchema = z.object({
  data: documentDataSchema,
});

export const persistedDraftSchema = z.object({
  documentData: draftDocumentDataSchema,
  docStatus: z.enum(["draft", "published"]),
  lastPublishedSlug: z.string().min(1).optional(),
});

export type PublishPayload = z.infer<typeof publishPayloadSchema>;
export type PersistedDraftPayload = z.infer<typeof persistedDraftSchema>;
