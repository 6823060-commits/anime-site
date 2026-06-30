"use client";
import { useState } from "react";
import { Heart } from "lucide-react";

export function FavoriteButton({ animeId, isFav }: { animeId: string; isFav: boolean }) {
  const [fav, setFav] = useState(isFav);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    const res = await fetch("/api/favorites", {
      method: fav ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ animeId }),
    });
    if (res.ok) setFav(!fav);
    setLoading(false);
  };

  return (
    <button className={`btn btn-lg ${fav ? "btn-primary" : "btn-secondary"}`} onClick={toggle} disabled={loading}>
      <Heart size={18} fill={fav ? "currentColor" : "none"} />
      {fav ? "Дуртайд нэмэгдсэн" : "Дуртайд нэмэх"}
    </button>
  );
}
