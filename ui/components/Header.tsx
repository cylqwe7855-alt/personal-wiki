"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useLocale } from "@/lib/locale-context";

export default function Header() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const { t, toggle } = useLocale();

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <header className="mw-header">
      <div className="mw-header-inner">
        <Link href="/" className="mw-logo">
          {t.siteName}
        </Link>
        <form className="mw-search-form" onSubmit={handleSearch}>
          <input
            className="mw-search-input"
            type="search"
            placeholder={t.searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search"
          />
          <button className="mw-search-btn" type="submit">
            {t.search}
          </button>
        </form>
        <nav className="mw-header-nav">
          <Link href="/">{t.mainPage}</Link>
          <Link href="/graph">{t.graphView}</Link>
          <Link href="/search">{t.search}</Link>
          <button
            onClick={toggle}
            className="mw-lang-toggle"
            title="Switch language"
          >
            {t.language}
          </button>
        </nav>
      </div>
    </header>
  );
}
