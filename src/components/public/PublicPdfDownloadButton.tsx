"use client";

import { Download01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useState } from "react";

type PublicPdfDownloadButtonProps = {
  slug: string;
};

export function PublicPdfDownloadButton({ slug }: PublicPdfDownloadButtonProps) {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleDownload = useCallback(async () => {
    setDownloadError(null);
    setDownloading(true);

    try {
      const response = await fetch(`/api/pdf/${slug}`);

      if (!response.ok) {
        let errorMessage = "No se pudo exportar el PDF.";

        try {
          const payload = (await response.json()) as { error?: string };
          if (payload.error) {
            errorMessage = payload.error;
          }
        } catch {
          // Keep default error message when response isn't JSON.
        }

        throw new Error(errorMessage);
      }

      const pdfBlob = await response.blob();
      if (pdfBlob.size === 0) {
        throw new Error("El PDF generado está vacío.");
      }

      const blobUrl = URL.createObjectURL(pdfBlob);
      const downloadLink = document.createElement("a");
      downloadLink.href = blobUrl;
      downloadLink.download = `propuesta-${slug}.pdf`;
      downloadLink.style.display = "none";

      document.body.append(downloadLink);
      downloadLink.click();
      downloadLink.remove();

      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1_000);
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : "No se pudo exportar el PDF.");
    } finally {
      setDownloading(false);
    }
  }, [slug]);

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={() => void handleDownload()}
        disabled={downloading}
        className="sumar-button-primary inline-flex items-center gap-2"
      >
        <HugeiconsIcon icon={Download01Icon} size={16} color="currentColor" strokeWidth={2} />
        {downloading ? "Exportando..." : "Descargar propuesta"}
      </button>

      {downloadError ? <p className="max-w-md text-xs text-red-200">{downloadError}</p> : null}
    </div>
  );
}
