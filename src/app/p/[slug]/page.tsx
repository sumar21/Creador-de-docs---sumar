import { notFound } from "next/navigation";

import { PublicDocPage } from "@/components/public/PublicDocPage";
import { getDocumentRepository } from "@/lib/server/repositories/local-json-repo";

type PublicPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ print?: string }>;
};

export default async function PublishedDocPage({ params, searchParams }: PublicPageProps) {
  const { slug } = await params;
  const query = await searchParams;

  const repository = getDocumentRepository();
  const record = await repository.getBySlug(slug);

  if (!record) {
    notFound();
  }

  return <PublicDocPage slug={slug} data={record.data} printMode={query.print === "1"} />;
}
