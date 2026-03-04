import type { DocumentRepository } from "./document-repo";
import { getDocumentRepository as getLocalDocumentRepository } from "./local-json-repo";
import { createSupabaseDocumentRepository } from "./supabase-repo";

let repository: DocumentRepository | null = null;
let repositoryProvider: "supabase" | "local" | null = null;

function firstNonEmpty(...values: Array<string | undefined>): string | undefined {
  return values.find((value) => value && value.trim().length > 0)?.trim();
}

function createRepository(): DocumentRepository {
  const supabaseUrl = firstNonEmpty(process.env.SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_URL);
  const supabaseServiceRoleKey = firstNonEmpty(
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    process.env.SUPABASE_SECRET_KEY,
    process.env.SUPABASE_SERVICE_KEY,
  );
  const supabaseTable = process.env.SUPABASE_PUBLISHED_DOCUMENTS_TABLE?.trim() || "published_documents";
  const runningOnServerless = process.env.VERCEL === "1" || process.cwd().startsWith("/var/task");
  const hasAnySupabaseEnv = Boolean(supabaseUrl || supabaseServiceRoleKey);

  if (hasAnySupabaseEnv && (!supabaseUrl || !supabaseServiceRoleKey)) {
    throw new Error(
      "Configuración Supabase incompleta. Definí SUPABASE_URL (o NEXT_PUBLIC_SUPABASE_URL) y SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  if (supabaseUrl && supabaseServiceRoleKey) {
    repositoryProvider = "supabase";
    return createSupabaseDocumentRepository({
      url: supabaseUrl,
      serviceRoleKey: supabaseServiceRoleKey,
      table: supabaseTable,
    });
  }

  if (runningOnServerless) {
    throw new Error(
      "Persistencia no configurada para serverless. En Vercel definí SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  repositoryProvider = "local";
  return getLocalDocumentRepository();
}

export function getDocumentRepository(): DocumentRepository {
  if (!repository) {
    repository = createRepository();
  }

  return repository;
}

export function getDocumentRepositoryProvider(): "supabase" | "local" {
  if (!repository) {
    repository = createRepository();
  }

  if (!repositoryProvider) {
    throw new Error("Document repository provider is not initialized.");
  }

  return repositoryProvider;
}
