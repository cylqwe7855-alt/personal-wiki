import { buildPageData } from "@/lib/wiki";
import WikiArticle from "@/components/WikiArticle";
import Link from "next/link";

export default async function Home() {
  const page = await buildPageData(["index"]);

  if (!page) {
    return (
      <div>
        <h1 className="mw-page-title">Welcome to Personal Wiki</h1>
        <p>No index page found. Add content to your wiki directory to get started.</p>
        <p><Link href="/graph">View graph</Link> | <Link href="/search">Search</Link></p>
      </div>
    );
  }

  return <WikiArticle page={page} />;
}
