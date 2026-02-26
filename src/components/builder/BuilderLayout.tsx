"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ConfigPanel } from "@/components/builder/ConfigPanel";
import { PublishActions } from "@/components/builder/PublishActions";
import { DocumentPreview } from "@/components/document/DocumentPreview";
import { loadDraft, saveDraft } from "@/lib/builder/local-draft";
import { useBuilderStore } from "@/store/builder-store";

type PublishResponse = {
  slug: string;
  url: string;
  status: "published";
};

export function BuilderLayout() {
  const documentData = useBuilderStore((state) => state.documentData);
  const saveState = useBuilderStore((state) => state.saveState);
  const docStatus = useBuilderStore((state) => state.docStatus);
  const lastPublishedSlug = useBuilderStore((state) => state.lastPublishedSlug);

  const hydrate = useBuilderStore((state) => state.hydrate);
  const setSaveState = useBuilderStore((state) => state.setSaveState);
  const getPersistedState = useBuilderStore((state) => state.getPersistedState);
  const publishSuccess = useBuilderStore((state) => state.publishSuccess);

  const [ready, setReady] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [publishResult, setPublishResult] = useState<PublishResponse | null>(null);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const [previewData, setPreviewData] = useState(documentData);

  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      hydrate(draft);
    }

    setReady(true);
  }, [hydrate]);

  useEffect(() => {
    if (!ready || saveState !== "dirty") {
      return;
    }

    setSaveState("saving");
    const timeoutId = window.setTimeout(() => {
      saveDraft(getPersistedState());
      setSaveState("saved");
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [documentData, docStatus, getPersistedState, lastPublishedSlug, ready, saveState, setSaveState]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setPreviewData(documentData);
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [documentData]);

  const manualSelected = documentData.docType === "manual";

  const publishDocument = useCallback(
    async (showModal: boolean): Promise<string | null> => {
      if (manualSelected) {
        setActionError("Manual está en desarrollo: no se puede publicar todavía.");
        return null;
      }

      setActionError(null);
      setPublishing(true);

      try {
        const response = await fetch("/api/publish", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data: documentData }),
        });

        const payload = (await response.json()) as PublishResponse | { error?: string };
        if (!response.ok || !("slug" in payload)) {
          throw new Error((payload as { error?: string }).error ?? "No se pudo publicar el documento.");
        }

        publishSuccess(payload.slug);
        setPublishResult(payload);

        if (showModal) {
          setPublishModalOpen(true);
        }

        return payload.slug;
      } catch (error) {
        setActionError(error instanceof Error ? error.message : "No se pudo publicar el documento.");
        return null;
      } finally {
        setPublishing(false);
      }
    },
    [documentData, manualSelected, publishSuccess],
  );

  const handlePublish = useCallback(() => {
    void publishDocument(true);
  }, [publishDocument]);

  const handleExportPdf = useCallback(async () => {
    if (manualSelected) {
      setActionError("Manual está en desarrollo: PDF no disponible por ahora.");
      return;
    }

    setActionError(null);
    setExportingPdf(true);

    try {
      let targetSlug: string | null = lastPublishedSlug ?? null;
      if (docStatus !== "published" || !targetSlug) {
        targetSlug = await publishDocument(false);
      }

      if (!targetSlug) {
        throw new Error("No fue posible obtener el slug para exportar el PDF.");
      }

      window.open(`/api/pdf/${targetSlug}`, "_blank", "noopener,noreferrer");
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "No se pudo exportar el PDF.");
    } finally {
      setExportingPdf(false);
    }
  }, [docStatus, lastPublishedSlug, manualSelected, publishDocument]);

  const publishUrl = useMemo(() => {
    if (!publishResult) {
      return "";
    }

    if (publishResult.url.startsWith("http")) {
      return publishResult.url;
    }

    if (typeof window === "undefined") {
      return publishResult.url;
    }

    return `${window.location.origin}${publishResult.url}`;
  }, [publishResult]);

  const handleCopyUrl = useCallback(async () => {
    if (!publishUrl) {
      return;
    }

    await navigator.clipboard.writeText(publishUrl);
    setCopyState("copied");
    window.setTimeout(() => setCopyState("idle"), 1400);
  }, [publishUrl]);

  return (
    <div className="min-h-dvh bg-app text-zinc-100">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#09090c]/88 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-6">
          <div className="flex min-w-0 items-center gap-4">
            <Image src="/sumar-logo.png" alt="Sumar" width={145} height={54} priority className="h-auto w-[132px]" />
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.17em] text-zinc-400">Propuestas comerciales</p>
              <p className="truncate text-sm text-zinc-200">Template lockeado con preview en vivo</p>
            </div>
          </div>

          <PublishActions
            onPublish={handlePublish}
            onExport={handleExportPdf}
            publishing={publishing}
            exportingPdf={exportingPdf}
            isManual={manualSelected}
          />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-4 py-4 md:px-6 md:py-6 lg:h-[calc(100dvh-88px)] lg:flex-row">
        <aside className="lg:w-[380px] lg:shrink-0 lg:overflow-y-auto">
          <div className="rounded-2xl border border-white/10 bg-[#121319]/80 shadow-soft">
            <ConfigPanel />
          </div>
        </aside>

        <section className="min-h-[55dvh] flex-1 overflow-hidden rounded-[28px] border border-white/10 bg-[#101116]/72 shadow-soft">
          {ready ? <DocumentPreview data={previewData} /> : null}
        </section>
      </main>

      {manualSelected ? (
        <div className="fixed bottom-4 right-4 rounded-xl border border-[#fffb17]/35 bg-[#fffb17]/15 px-4 py-2 text-sm text-[#fffda5] shadow-[0_10px_30px_rgba(255,251,23,0.12)]">
          Manual en desarrollo: generación y PDF deshabilitados.
        </div>
      ) : null}

      {actionError ? (
        <div className="fixed bottom-4 left-4 rounded-xl border border-red-200/20 bg-red-500/10 px-4 py-2 text-sm text-red-200 shadow-soft">
          {actionError}
        </div>
      ) : null}

      {publishModalOpen && publishResult ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/15 bg-[#15161d] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.45)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-400">Publicado</p>
                <h3 className="mt-2 text-xl font-semibold text-zinc-100">Link generado</h3>
              </div>
              <button
                type="button"
                className="sumar-button-ghost"
                onClick={() => setPublishModalOpen(false)}
              >
                Cerrar
              </button>
            </div>

            <p className="mt-4 text-sm text-zinc-300">Compartí esta URL pública de la propuesta:</p>
            <div className="mt-2 rounded-xl border border-white/10 bg-black/25 p-3 text-sm text-zinc-200">{publishUrl}</div>

            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="sumar-button-secondary" onClick={handleCopyUrl}>
                {copyState === "copied" ? "Copiado" : "Copiar URL"}
              </button>
              <a href={publishUrl} target="_blank" rel="noreferrer" className="sumar-button-primary inline-flex items-center">
                Abrir
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
