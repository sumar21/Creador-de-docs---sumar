"use client";

import { motion } from "framer-motion";

import type { DocumentData } from "@/lib/types/document";

import { ProposalDocument } from "./ProposalDocument";

type DocumentPreviewProps = {
  data: DocumentData;
};

export function DocumentPreview({ data }: DocumentPreviewProps) {
  return (
    <div className="h-full overflow-y-auto px-4 py-5 [scrollbar-gutter:stable] lg:snap-y lg:snap-mandatory md:px-8 md:py-8">
      <motion.div
        key={`${data.docType}-${data.proposals.length}`}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className="mx-auto w-full max-w-[1920px]"
      >
        <ProposalDocument data={data} />
      </motion.div>
    </div>
  );
}
