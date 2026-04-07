import { searchPages } from "@/lib/wiki";
import Link from "next/link";
import { slugToHref } from "@/lib/utils";
import SearchBox from "@/components/SearchBox";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q ?? "";
  const results = query ? searchPages(query) : [];

  return (
    <div>
      <h1 className="mw-page-title">Search</h1>

      <SearchBox initialQuery={query} />

      {query && (
        <div style={{ marginTop: 16 }}>
          {results.length === 0 ? (
            <p style={{ color: "#54595d" }}>
              No results found for <strong>&ldquo;{query}&rdquo;</strong>.
            </p>
          ) : (
            <>
              <p style={{ fontSize: 13, color: "#54595d", marginBottom: 16 }}>
                {results.length} result{results.length !== 1 ? "s" : ""} for{" "}
                <strong>&ldquo;{query}&rdquo;</strong>
              </p>
              {results.map((r) => (
                <div key={r.slug.join("/")} className="search-result">
                  <div className="search-result-title">
                    <Link href={slugToHref(r.slug)}>{r.title}</Link>
                  </div>
                  <div className="search-result-excerpt">{r.excerpt}</div>
                  <div className="search-result-meta">
                    {r.slug.join(" / ")}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {!query && (
        <p style={{ color: "#54595d", marginTop: 16 }}>
          Enter a search term above to search across all wiki pages.
        </p>
      )}
    </div>
  );
}
