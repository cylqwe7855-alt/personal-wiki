"use client";

import Link from "next/link";
import { WikiPageWithHtml, RelatedLink } from "@/lib/wiki";
import { slugToHref } from "@/lib/utils";
import TableOfContents from "./TableOfContents";
import { useLocale } from "@/lib/locale-context";

interface WikiArticleProps {
  page: WikiPageWithHtml;
}

export default function WikiArticle({ page }: WikiArticleProps) {
  const fm = page.frontmatter;
  const isIndex = page.slug.length === 1 && page.slug[0] === "index";
  const { t } = useLocale();

  return (
    <article>
      {/* Page title */}
      <h1 className="mw-page-title">
        {page.title}
        {fm.type && !isIndex && (
          <span className="mw-type-badge">{fm.type}</span>
        )}
      </h1>

      {/* Metadata bar */}
      {!isIndex && (fm.created || fm.last_updated) && (
        <div className="mw-meta-bar">
          {fm.created && <span>{t.created}: {fm.created}</span>}
          {fm.last_updated && <span>{t.updated}: {fm.last_updated}</span>}
          {fm.sources && fm.sources.length > 0 && (
            <span>{t.sources}: {fm.sources.length}</span>
          )}
        </div>
      )}

      {/* TOC */}
      <TableOfContents entries={page.toc} />

      {/* Main content */}
      <div
        className="wiki-content"
        dangerouslySetInnerHTML={{ __html: page.html }}
      />

      {/* Related links */}
      {page.relatedLinks && page.relatedLinks.length > 0 && (
        <div className="mw-related">
          <div className="mw-related-title">{t.relatedArticles}</div>
          <ul>
            {page.relatedLinks.map((rl) => (
              <li key={rl.label}>
                {rl.href ? (
                  <Link href={rl.href}>{rl.label}</Link>
                ) : (
                  <span style={{ color: "#54595d" }}>{rl.label}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Backlinks */}
      {page.backlinks.length > 0 && (
        <div className="mw-backlinks">
          <h2>{t.pagesLinkHere}</h2>
          <ul>
            {page.backlinks.map((bl) => (
              <li key={bl.slug.join("/")}>
                <Link href={slugToHref(bl.slug)}>{bl.title}</Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
