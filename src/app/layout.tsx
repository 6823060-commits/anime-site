import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { SessionProvider } from "@/components/layout/SessionProvider";

export const metadata: Metadata = {
  title: "АнимэМН — Монгол Анимэ Стриминг",
  description: "Монгол хэл дээр анимэ үзэх тавцан",
};

function ThemeScript() {
  const script = `
    (function () {
      try {
        var saved = localStorage.getItem("theme");
        var prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
        var theme = saved || (prefersLight ? "light" : "dark");
        document.documentElement.setAttribute("data-theme", theme);
      } catch (e) {
        document.documentElement.setAttribute("data-theme", "dark");
      }
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="mn" suppressHydrationWarning>
      <body>
        <ThemeScript />
        <SessionProvider>
          <Navbar />
          <main>{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}