import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { PublishedDocumentRecord } from "@/lib/types/document";

import type { DocumentRepository } from "./document-repo";

type StoreShape = Record<string, PublishedDocumentRecord>;

const DEFAULT_LOCAL_DATA_DIR = path.join(process.cwd(), ".data");
const SERVERLESS_DATA_DIR = path.join("/tmp", "sumar-proposal-builder-data");
const DATA_DIR =
  process.env.PUBLISHED_DOCUMENTS_DATA_DIR ||
  (process.cwd().startsWith("/var/task") ? SERVERLESS_DATA_DIR : DEFAULT_LOCAL_DATA_DIR);
const DATA_FILE = path.join(DATA_DIR, "published-documents.json");

let writeQueue = Promise.resolve();

async function ensureStoreFile(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });

  try {
    await readFile(DATA_FILE, "utf8");
  } catch {
    await writeFile(DATA_FILE, "{}\n", "utf8");
  }
}

async function readStore(): Promise<StoreShape> {
  await ensureStoreFile();

  try {
    const raw = await readFile(DATA_FILE, "utf8");
    if (!raw.trim()) {
      return {};
    }

    const parsed = JSON.parse(raw) as StoreShape;
    if (!parsed || typeof parsed !== "object") {
      return {};
    }

    return parsed;
  } catch {
    return {};
  }
}

async function writeStore(data: StoreShape): Promise<void> {
  await ensureStoreFile();
  await writeFile(DATA_FILE, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function enqueueWrite<T>(work: () => Promise<T>): Promise<T> {
  const next = writeQueue.then(work, work);
  writeQueue = next.then(
    () => undefined,
    () => undefined,
  );

  return next;
}

class LocalJsonDocumentRepository implements DocumentRepository {
  async getBySlug(slug: string): Promise<PublishedDocumentRecord | null> {
    const store = await readStore();
    return store[slug] ?? null;
  }

  async slugExists(slug: string): Promise<boolean> {
    const store = await readStore();
    return Boolean(store[slug]);
  }

  async save(record: PublishedDocumentRecord): Promise<PublishedDocumentRecord> {
    return enqueueWrite(async () => {
      const store = await readStore();
      store[record.slug] = record;
      await writeStore(store);
      return record;
    });
  }
}

const localJsonDocumentRepository = new LocalJsonDocumentRepository();

export function getDocumentRepository(): DocumentRepository {
  return localJsonDocumentRepository;
}
