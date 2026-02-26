export interface Client {
  name: string;
  logoUrl?: string;
}

export interface ProposalOption {
  id: string;
  title: string;
  currency: "ARS" | "USD";
  total: number;
  note?: string;
}

export type DocType = "proposal" | "manual";

export interface AISuggestion {
  id: string;
  type: "add_proposal" | "add_block";
  title: string;
  description: string;
  payload: Record<string, unknown>;
}

export interface DocumentData {
  docType: DocType;
  client: Client;
  proposals: ProposalOption[];
  meetingNotes?: string;
  aiSuggestions?: AISuggestion[];
}

export type DocumentStatus = "draft" | "published";

export interface PublishedDocumentRecord {
  slug: string;
  data: DocumentData;
  createdAt: string;
  updatedAt: string;
  status: "published";
}
