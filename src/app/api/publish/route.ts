import { customAlphabet } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

import { getRequestOrigin } from "@/lib/server/request-origin";
import { getDocumentRepository } from "@/lib/server/repositories/local-json-repo";
import type { PublishedDocumentRecord } from "@/lib/types/document";
import { publishPayloadSchema } from "@/lib/validation/document";

const createSlug = customAlphabet("23456789abcdefghjkmnpqrstuvwxyz", 10);

async function generateUniqueSlug(): Promise<string> {
  const repository = getDocumentRepository();

  for (let index = 0; index < 12; index += 1) {
    const slug = createSlug();
    const exists = await repository.slugExists(slug);

    if (!exists) {
      return slug;
    }
  }

  throw new Error("No se pudo generar un slug único.");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = publishPayloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Payload inválido.",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    if (parsed.data.data.docType === "manual") {
      return NextResponse.json(
        {
          error: "Manual está en desarrollo y no puede publicarse todavía.",
        },
        { status: 422 },
      );
    }

    const slug = await generateUniqueSlug();
    const repository = getDocumentRepository();
    const now = new Date().toISOString();

    const record: PublishedDocumentRecord = {
      slug,
      data: parsed.data.data,
      createdAt: now,
      updatedAt: now,
      status: "published",
    };

    await repository.save(record);

    return NextResponse.json(
      {
        slug,
        url: `${getRequestOrigin(request)}/p/${slug}`,
        status: "published",
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error inesperado al publicar.",
      },
      { status: 500 },
    );
  }
}
