"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Locale, Labels, labels } from "./i18n";

interface LocaleContextValue {
  locale: Locale;
  t: Labels;
  toggle: () => void;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: "zh",
  t: labels.zh,
  toggle: () => {},
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("zh");

  useEffect(() => {
    const saved = localStorage.getItem("wiki-locale") as Locale | null;
    if (saved === "en" || saved === "zh") setLocale(saved);
  }, []);

  function toggle() {
    const next = locale === "zh" ? "en" : "zh";
    setLocale(next);
    localStorage.setItem("wiki-locale", next);
  }

  return (
    <LocaleContext.Provider value={{ locale, t: labels[locale], toggle }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
