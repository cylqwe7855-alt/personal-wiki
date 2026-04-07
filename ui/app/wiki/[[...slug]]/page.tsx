import { notFound } from "next/navigation";
import { buildPageData, getAllPages, decodeSlug } from "@/lib/wiki";
import WikiArticle from "@/components/WikiArticle";

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

export async function generateStaticParams() {
  const pages = getAllPages();
  return pages
    .filter((p) => !(p.slug.length === 1 && p.slug[0] === "index"))
    .map((p) => ({ slug: p.slug.map((s) => encodeURIComponent(s)) }));
}

export default async function WikiPage({ params }: PageProps) {
  const { slug } = await params;
  const resolvedSlug = decodeSlug(slug ?? ["index"]);

  const page = await buildPageData(resolvedSlug);
  if (!page) notFound();

  return <WikiArticle page={page} />;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const resolvedSlug = decodeSlug(slug ?? ["index"]);
  const page = await buildPageData(resolvedSlug);
  return {
    title: page ? `${page.title} — Personal Wiki` : "Page Not Found",
  };
}
