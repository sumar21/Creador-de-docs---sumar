import type { PublishedDocumentRecord } from "@/lib/types/document";

export interface DocumentRepository {
  getBySlug(slug: string): Promise<PublishedDocumentRecord | null>;
  slugExists(slug: string): Promise<boolean>;
  save(record: PublishedDocumentRecord): Promise<PublishedDocumentRecord>;
}
