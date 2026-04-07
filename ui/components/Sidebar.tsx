"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Category } from "@/lib/wiki";
import { slugToHref } from "@/lib/utils";
import { useLocale } from "@/lib/locale-context";

interface SidebarProps {
  categories: Category[];
}

export default function Sidebar({ categories }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useLocale();

  return (
    <nav className="mw-sidebar">
      <div className="mw-sidebar-section">
        <div className="mw-sidebar-heading">{t.navigation}</div>
        <ul>
          <li><Link href="/" className={pathname === "/" ? "active" : ""}>{t.mainPage}</Link></li>
          <li><Link href="/graph" className={pathname === "/graph" ? "active" : ""}>{t.graphView}</Link></li>
          <li><Link href="/search" className={pathname === "/search" ? "active" : ""}>{t.search}</Link></li>
        </ul>
      </div>

      {categories.map((cat) => (
        <div key={cat.name} className="mw-sidebar-section">
          <div className="mw-sidebar-heading">{cat.name}</div>
          <ul>
            {cat.pages.map((page) => {
              const href = slugToHref(page.slug);
              const isActive = pathname === href || pathname === decodeURIComponent(href);
              return (
                <li key={page.slug.join("/")}>
                  <Link href={href} className={isActive ? "active" : ""} title={page.title}>
                    {page.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
