"use client";

import { useMemo, useRef, useState, type ChangeEvent } from "react";
import Image from "next/image";

import { features } from "@/config/features";
import { getMockSuggestionsFromNotes } from "@/lib/ai/mock-suggestions";
import type { ProposalOption } from "@/lib/types/document";
import { useBuilderStore } from "@/store/builder-store";

const ACCEPTED_LOGO_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"];
const MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024;

function saveStateLabel(value: "saved" | "dirty" | "saving"): string {
  if (value === "saved") {
    return "Guardado";
  }

  if (value === "saving") {
    return "Guardando";
  }

  return "Sin guardar";
}

function formatProposalCount(count: number): string {
  return `Total propuestas: ${count}`;
}

export function ConfigPanel() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [suggestionMessage, setSuggestionMessage] = useState<string | null>(null);

  const documentData = useBuilderStore((state) => state.documentData);
  const saveState = useBuilderStore((state) => state.saveState);
  const docStatus = useBuilderStore((state) => state.docStatus);

  const setClientName = useBuilderStore((state) => state.setClientName);
  const setClientLogo = useBuilderStore((state) => state.setClientLogo);
  const setDocType = useBuilderStore((state) => state.setDocType);
  const updateProposal = useBuilderStore((state) => state.updateProposal);
  const addProposal = useBuilderStore((state) => state.addProposal);
  const removeProposal = useBuilderStore((state) => state.removeProposal);
  const moveProposal = useBuilderStore((state) => state.moveProposal);
  const setMeetingNotes = useBuilderStore((state) => state.setMeetingNotes);
  const setAISuggestions = useBuilderStore((state) => state.setAISuggestions);
  const applySuggestion = useBuilderStore((state) => state.applySuggestion);

  const canAddProposal = documentData.proposals.length < features.maxProposals;

  const aiSuggestions = useMemo(() => documentData.aiSuggestions ?? [], [documentData.aiSuggestions]);

  const onLogoPick = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setLogoError(null);

    if (!ACCEPTED_LOGO_TYPES.includes(file.type)) {
      setLogoError("Formato inválido. Usá PNG, SVG o JPG.");
      return;
    }

    if (file.size > MAX_LOGO_SIZE_BYTES) {
      setLogoError("El logo excede 2MB. Elegí un archivo más liviano.");
      return;
    }

    const result = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("No se pudo leer el archivo."));
      reader.readAsDataURL(file);
    }).catch(() => "");

    if (!result) {
      setLogoError("No se pudo procesar el logo.");
      return;
    }

    setClientLogo(result);

    if (event.target) {
      event.target.value = "";
    }
  };

  const handleAnalyzeWithIA = () => {
    const suggestions = getMockSuggestionsFromNotes(documentData.meetingNotes ?? "");
    setAISuggestions(suggestions);

    if (suggestions.length === 0) {
      setSuggestionMessage("No se encontraron sugerencias relevantes.");
      return;
    }

    setSuggestionMessage(`Se generaron ${suggestions.length} sugerencia(s).`);
  };

  const handleApplySuggestion = (suggestionId: string) => {
    const target = aiSuggestions.find((item) => item.id === suggestionId);
    applySuggestion(suggestionId);

    if (target?.type === "add_block" && !features.autoApplySuggestedBlocks) {
      setSuggestionMessage("La sugerencia se guardó como recomendación (sin editar el template).");
    } else {
      setSuggestionMessage("Sugerencia aplicada.");
    }
  };

  const handleRemoveProposal = (proposal: ProposalOption) => {
    if (!window.confirm(`¿Eliminar "${proposal.title}"?`)) {
      return;
    }

    removeProposal(proposal.id);
  };

  return (
    <div className="space-y-4 p-4 md:p-5">
      <section className="sumar-card space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-300">Estado</h2>
          <span className="sumar-badge">{saveStateLabel(saveState)}</span>
        </div>
        <p className="text-sm text-zinc-400">
          Documento en <span className="font-medium text-zinc-200">{docStatus === "draft" ? "Draft" : "Published"}</span>
        </p>
      </section>

      <section className="sumar-card space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-300">1) Cliente</h2>

        <label className="space-y-2 text-sm text-zinc-300">
          <span>Nombre del cliente</span>
          <input
            className="sumar-input"
            type="text"
            value={documentData.client.name}
            onChange={(event) => setClientName(event.target.value)}
            placeholder="Ej: Empresa ABC"
          />
        </label>

        <div className="space-y-2">
          <p className="text-sm text-zinc-300">Logo del cliente (opcional)</p>

          {documentData.client.logoUrl ? (
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <Image
                src={documentData.client.logoUrl}
                alt="Preview logo"
                width={128}
                height={40}
                unoptimized
                className="h-10 w-auto max-w-[128px] object-contain"
              />
              <div className="ml-auto flex gap-2">
                <button
                  type="button"
                  className="sumar-button-secondary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Cambiar logo
                </button>
                <button type="button" className="sumar-button-ghost" onClick={() => setClientLogo(undefined)}>
                  Quitar
                </button>
              </div>
            </div>
          ) : (
            <button type="button" className="sumar-button-secondary w-full" onClick={() => fileInputRef.current?.click()}>
              Subir logo
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.svg,image/png,image/jpeg,image/svg+xml"
            className="hidden"
            onChange={onLogoPick}
          />

          {logoError ? <p className="text-xs text-red-300">{logoError}</p> : null}
        </div>
      </section>

      <section className="sumar-card space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-300">2) Tipo de documento</h2>

        <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-black/20 p-1">
          <button
            type="button"
            className={`sumar-segment ${documentData.docType === "proposal" ? "sumar-segment-active" : ""}`}
            onClick={() => setDocType("proposal")}
          >
            Propuesta
          </button>
          <button
            type="button"
            className={`sumar-segment ${documentData.docType === "manual" ? "sumar-segment-active" : ""}`}
            onClick={() => setDocType("manual")}
          >
            Manual
          </button>
        </div>

        {documentData.docType === "manual" ? (
          <div className="rounded-xl border border-dashed border-[#fffb17]/40 bg-[#fffb17]/10 p-3 text-sm text-[#fffda5]">
            Módulo Manual en desarrollo. Próximamente disponible.
          </div>
        ) : null}
      </section>

      <section className="sumar-card space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-300">3) Propuestas</h2>
          <span className="text-xs text-zinc-400">{formatProposalCount(documentData.proposals.length)}</span>
        </div>

        <div className="space-y-3">
          {documentData.proposals.map((proposal, index) => (
            <article key={proposal.id} className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <label className="space-y-1 text-sm text-zinc-300">
                <span>Nombre de propuesta</span>
                <input
                  className="sumar-input"
                  type="text"
                  value={proposal.title}
                  maxLength={120}
                  onChange={(event) => updateProposal(proposal.id, { title: event.target.value })}
                />
              </label>

              <div className="grid grid-cols-2 gap-2">
                <label className="space-y-1 text-sm text-zinc-300">
                  <span>Moneda</span>
                  <select
                    className="sumar-input"
                    value={proposal.currency}
                    onChange={(event) =>
                      updateProposal(proposal.id, {
                        currency: event.target.value === "USD" ? "USD" : "ARS",
                      })
                    }
                  >
                    <option value="ARS">ARS</option>
                    <option value="USD">USD</option>
                  </select>
                </label>

                <label className="space-y-1 text-sm text-zinc-300">
                  <span>Monto total</span>
                  <input
                    className="sumar-input"
                    type="number"
                    min={0}
                    step="0.01"
                    value={proposal.total}
                    onChange={(event) => {
                      const parsed = Number(event.target.value);
                      updateProposal(proposal.id, { total: Number.isFinite(parsed) ? parsed : 0 });
                    }}
                  />
                </label>
              </div>

              <label className="space-y-1 text-sm text-zinc-300">
                <span>Nota opcional</span>
                <input
                  className="sumar-input"
                  type="text"
                  value={proposal.note ?? ""}
                  maxLength={240}
                  placeholder="Incluye soporte 30 días"
                  onChange={(event) => updateProposal(proposal.id, { note: event.target.value })}
                />
              </label>

              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="sumar-button-ghost"
                    onClick={() => moveProposal(proposal.id, "up")}
                    disabled={index === 0}
                  >
                    Subir
                  </button>
                  <button
                    type="button"
                    className="sumar-button-ghost"
                    onClick={() => moveProposal(proposal.id, "down")}
                    disabled={index === documentData.proposals.length - 1}
                  >
                    Bajar
                  </button>
                </div>

                <button
                  type="button"
                  className="sumar-button-ghost"
                  onClick={() => handleRemoveProposal(proposal)}
                  disabled={documentData.proposals.length === 1}
                >
                  Eliminar
                </button>
              </div>
            </article>
          ))}
        </div>

        <button
          type="button"
          className="sumar-button-secondary w-full"
          disabled={!canAddProposal}
          onClick={() => addProposal()}
        >
          + Agregar propuesta
        </button>
        {!canAddProposal ? <p className="text-xs text-zinc-500">Límite alcanzado: máximo 3 propuestas.</p> : null}
      </section>

      <section className="sumar-card space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-300">4) Notas de reunión (IA)</h2>

        <label className="space-y-2 text-sm text-zinc-300">
          <span>Notas de IA (brief)</span>
          <textarea
            className="sumar-input min-h-28 resize-y"
            value={documentData.meetingNotes ?? ""}
            onChange={(event) => setMeetingNotes(event.target.value)}
            placeholder="Pegá aquí el brief desordenado, notas de la reunión o requerimientos del cliente…"
          />
        </label>

        <button type="button" className="sumar-button-secondary w-full" onClick={handleAnalyzeWithIA}>
          Analizar con IA
        </button>

        {suggestionMessage ? <p className="text-xs text-zinc-400">{suggestionMessage}</p> : null}

        <div className="space-y-2">
          <p className="text-sm font-medium text-zinc-200">Sugerencias</p>

          {aiSuggestions.length === 0 ? (
            <p className="rounded-xl border border-dashed border-white/20 bg-black/20 p-3 text-sm text-zinc-500">
              Todavía no hay sugerencias.
            </p>
          ) : (
            aiSuggestions.map((suggestion) => (
              <article key={suggestion.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-sm font-medium text-zinc-100">{suggestion.title}</p>
                <p className="mt-1 text-sm text-zinc-400">{suggestion.description}</p>
                {suggestion.type === "add_block" && !features.autoApplySuggestedBlocks ? (
                  <p className="mt-2 text-xs uppercase tracking-[0.12em] text-[#fffda5]">
                    Recomendación (no aplica cambios de template automáticamente)
                  </p>
                ) : null}
                <div className="mt-3">
                  <button type="button" className="sumar-button-ghost" onClick={() => handleApplySuggestion(suggestion.id)}>
                    Aplicar
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
