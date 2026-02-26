import type { PublishedDocumentRecord } from "@/lib/types/document";

import type { DocumentRepository } from "./document-repo";

// Stub intentionally left for future migration to Supabase.
export class SupabaseDocumentRepository implements DocumentRepository {
  async getBySlug(slug: string): Promise<PublishedDocumentRecord | null> {
    void slug;
    throw new Error("Supabase repository not implemented yet.");
  }

  async slugExists(slug: string): Promise<boolean> {
    void slug;
    throw new Error("Supabase repository not implemented yet.");
  }

  async save(record: PublishedDocumentRecord): Promise<PublishedDocumentRecord> {
    void record;
    throw new Error("Supabase repository not implemented yet.");
  }
}
