"use client";

type PublishActionsProps = {
  onPublish: () => void;
  onExport: () => void;
  publishing: boolean;
  exportingPdf: boolean;
  isManual: boolean;
};

export function PublishActions({
  onPublish,
  onExport,
  publishing,
  exportingPdf,
  isManual,
}: PublishActionsProps) {
  const disabled = isManual || publishing || exportingPdf;

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <button
        type="button"
        className="sumar-button-secondary"
        disabled={disabled}
        onClick={onPublish}
      >
        {publishing ? "Generando..." : "Generar Link"}
      </button>
      <button type="button" className="sumar-button-primary" disabled={disabled} onClick={onExport}>
        {exportingPdf ? "Exportando..." : "Exportar PDF"}
      </button>
    </div>
  );
}
