import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { SessionProvider } from "@/components/layout/SessionProvider";

export const metadata: Metadata = {
  title: "АнимэМН — Монгол Анимэ Стриминг",
  description: "Монгол хэл дээр анимэ үзэх тавцан",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn">
      <body>
        <SessionProvider>
          <Navbar />
          <main>{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
