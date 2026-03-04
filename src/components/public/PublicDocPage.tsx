import { Download01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { ProposalDocument } from "@/components/document/ProposalDocument";
import type { DocumentData } from "@/lib/types/document";

type PublicDocPageProps = {
  slug: string;
  data: DocumentData;
  printMode?: boolean;
};

export function PublicDocPage({ slug, data, printMode = false }: PublicDocPageProps) {
  const endAction = !printMode ? (
    <a
      href={`/api/pdf/${slug}`}
      download={`propuesta-${slug}.pdf`}
      className="sumar-button-primary inline-flex items-center gap-2"
    >
      <HugeiconsIcon icon={Download01Icon} size={16} color="currentColor" strokeWidth={2} />
      Descargar propuesta
    </a>
  ) : undefined;

  return (
    <main
      className={`sumar-public-main ${printMode ? "min-h-dvh" : "h-dvh overflow-hidden"} bg-app px-4 py-4 text-zinc-100 md:px-8`}
    >
      <div className={`sumar-public-shell mx-auto max-w-[1920px] ${printMode ? "" : "flex h-full min-h-0 flex-col"}`}>
        <div className={`sumar-public-content ${printMode ? "" : "min-h-0 flex-1"}`}>
          <ProposalDocument
            data={data}
            printMode={printMode}
            viewMode={printMode ? "stack" : "carousel"}
            endAction={endAction}
          />
        </div>
      </div>
    </main>
  );
}
