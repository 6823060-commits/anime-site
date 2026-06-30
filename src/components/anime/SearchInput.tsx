"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function SearchInput({ initialQ }: { initialQ: string }) {
  const [q, setQ] = useState(initialQ);
  const router = useRouter();
  return (
    <div className="search-box" style={{ maxWidth: 600 }}>
      <Search size={18} color="var(--text-muted)" />
      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        onKeyDown={e => e.key === "Enter" && router.push(`/search?q=${encodeURIComponent(q)}`)}
        placeholder="Анимэний нэр хайх..."
      />
      <button className="btn btn-primary btn-sm" onClick={() => router.push(`/search?q=${encodeURIComponent(q)}`)}>Хайх</button>
    </div>
  );
}
