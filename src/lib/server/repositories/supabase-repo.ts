import type { PublishedDocumentRecord } from "@/lib/types/document";

import type { DocumentRepository } from "./document-repo";

export interface SupabaseDocumentRepositoryConfig {
  url: string;
  serviceRoleKey: string;
  table: string;
}

type SupabaseDocumentRow = {
  slug: string;
  data: PublishedDocumentRecord["data"];
  created_at: string;
  updated_at: string;
  status: "published";
};

export class SupabaseDocumentRepository implements DocumentRepository {
  constructor(private readonly config: SupabaseDocumentRepositoryConfig) {}

  private buildEndpoint(query: string): string {
    const normalizedBaseUrl = this.config.url.replace(/\/+$/, "");
    return `${normalizedBaseUrl}/rest/v1/${this.config.table}${query}`;
  }

  private async request<T>(query: string, init?: RequestInit): Promise<T> {
    const headers = new Headers(init?.headers);
    headers.set("apikey", this.config.serviceRoleKey);
    headers.set("Authorization", `Bearer ${this.config.serviceRoleKey}`);
    headers.set("Content-Type", "application/json");

    const response = await fetch(this.buildEndpoint(query), {
      ...init,
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      const suffix = errorText.trim() ? ` ${errorText}` : "";
      throw new Error(`Supabase request failed (${response.status}).${suffix}`);
    }

    const text = await response.text();
    if (!text) {
      return [] as T;
    }

    return JSON.parse(text) as T;
  }

  private isValidRow(row: unknown): row is SupabaseDocumentRow {
    if (!row || typeof row !== "object") return false;
    const r = row as Record<string, unknown>;
    return (
      typeof r.slug === "string" &&
      typeof r.data === "object" &&
      r.data !== null &&
      typeof r.created_at === "string" &&
      typeof r.updated_at === "string" &&
      r.status === "published"
    );
  }

  private toRecord(row: SupabaseDocumentRow): PublishedDocumentRecord {
    return {
      slug: row.slug,
      data: row.data,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      status: row.status,
    };
  }

  async getBySlug(slug: string): Promise<PublishedDocumentRecord | null> {
    const encodedSlug = encodeURIComponent(slug);
    const rows = await this.request<unknown[]>(
      `?slug=eq.${encodedSlug}&select=slug,data,created_at,updated_at,status&limit=1`,
      { method: "GET" },
    );

    const row = rows[0];
    if (!row) return null;
    if (!this.isValidRow(row)) {
      throw new Error(`Supabase returned an unexpected row shape for slug "${slug}".`);
    }
    return this.toRecord(row);
  }

  async slugExists(slug: string): Promise<boolean> {
    const encodedSlug = encodeURIComponent(slug);
    const rows = await this.request<Array<{ slug: string }>>(
      `?slug=eq.${encodedSlug}&select=slug&limit=1`,
      { method: "GET" },
    );
    return rows.length > 0;
  }

  async save(record: PublishedDocumentRecord): Promise<PublishedDocumentRecord> {
    const rows = await this.request<SupabaseDocumentRow[]>("?on_conflict=slug", {
      method: "POST",
      headers: {
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify({
        slug: record.slug,
        data: record.data,
        created_at: record.createdAt,
        updated_at: record.updatedAt,
        status: record.status,
      }),
    });

    const row = rows[0];
    if (!row) {
      throw new Error("Supabase did not return the saved record.");
    }

    return this.toRecord(row);
  }
}

export function createSupabaseDocumentRepository(
  config: SupabaseDocumentRepositoryConfig,
): DocumentRepository {
  return new SupabaseDocumentRepository(config);
}
