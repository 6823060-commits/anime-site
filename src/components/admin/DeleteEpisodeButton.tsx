"use client";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function DeleteEpisodeButton({ id }: { id: string }) {
  const router = useRouter();
  const del = async () => {
    if (!confirm("Устгахдаа итгэлтэй байна уу?")) return;
    await fetch(`/api/episodes/${id}`, { method: "DELETE" });
    router.refresh();
  };
  return <button className="btn btn-danger btn-sm" onClick={del}><Trash2 size={13}/></button>;
}
