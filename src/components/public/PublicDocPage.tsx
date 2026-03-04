import { ProposalDocument } from "@/components/document/ProposalDocument";
import { PublicPdfDownloadButton } from "@/components/public/PublicPdfDownloadButton";
import type { DocumentData } from "@/lib/types/document";

type PublicDocPageProps = {
  slug: string;
  data: DocumentData;
  printMode?: boolean;
};

export function PublicDocPage({ slug, data, printMode = false }: PublicDocPageProps) {
  const endAction = !printMode ? <PublicPdfDownloadButton slug={slug} /> : undefined;

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
