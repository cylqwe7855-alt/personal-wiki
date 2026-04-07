import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { buildCategories } from "@/lib/wiki";
import { LocaleProvider } from "@/lib/locale-context";

export const metadata: Metadata = {
  title: "Personal Wiki",
  description: "Personal knowledge wiki",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = buildCategories();

  return (
    <html lang="zh" className="h-full">
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <LocaleProvider>
          <Header />
          <div className="mw-body">
            <Sidebar categories={categories} />
            <main className="mw-content">
              {children}
            </main>
          </div>
        </LocaleProvider>
      </body>
    </html>
  );
}
