import type { Browser } from "playwright-core";
import { NextRequest, NextResponse } from "next/server";

import { getRequestOrigin } from "@/lib/server/request-origin";
import { getDocumentRepository } from "@/lib/server/repositories";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type RouteContext = {
  params: Promise<{ slug: string }>;
};

function isServerlessRuntime(): boolean {
  return process.env.VERCEL === "1" || process.cwd().startsWith("/var/task");
}

async function launchBrowser(): Promise<Browser> {
  if (isServerlessRuntime()) {
    const chromium = (await import("@sparticuz/chromium")).default;
    const { chromium: playwrightChromium } = await import("playwright-core");

    return playwrightChromium.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }

  const { chromium } = await import("playwright");

  return chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
}

export async function GET(request: NextRequest, context: RouteContext) {
  let browser: Browser | null = null;

  try {
    const { slug } = await context.params;
    const repository = getDocumentRepository();
    const record = await repository.getBySlug(slug);

    if (!record) {
      return NextResponse.json({ error: "Documento no encontrado." }, { status: 404 });
    }

    if (record.data.docType === "manual") {
      return NextResponse.json(
        { error: "Manual está en desarrollo y no puede exportarse en PDF." },
        { status: 409 },
      );
    }

    browser = await launchBrowser();

    const page = await browser.newPage({
      viewport: {
        width: 1440,
        height: 2200,
      },
    });

    const targetUrl = new URL(`/p/${slug}?print=1`, getRequestOrigin(request)).toString();

    await page.goto(targetUrl, {
      waitUntil: "domcontentloaded",
      timeout: 45_000,
    });
    await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => undefined);

    await page.emulateMedia({ media: "print" });
    await page.evaluate(async () => {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "12mm",
        right: "10mm",
        bottom: "12mm",
        left: "10mm",
      },
    });

    const pdfBytes = new Uint8Array(pdfBuffer);

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=propuesta-${slug}.pdf`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? `No se pudo generar el PDF: ${error.message}`
            : "No se pudo generar el PDF.",
      },
      { status: 500 },
    );
  } finally {
    await browser?.close();
  }
}
