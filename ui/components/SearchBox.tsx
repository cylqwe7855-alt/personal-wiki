"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useLocale } from "@/lib/locale-context";

interface SearchBoxProps {
  initialQuery?: string;
}

export default function SearchBox({ initialQuery = "" }: SearchBoxProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const { t } = useLocale();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/search");
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
      <input
        className="mw-search-input"
        style={{ borderRight: "1px solid #a2a9b1", borderRadius: 2, maxWidth: 500 }}
        type="search"
        placeholder={t.searchPlaceholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
      />
      <button className="mw-search-btn" type="submit" style={{ borderRadius: 2 }}>
        {t.search}
      </button>
    </form>
  );
}
