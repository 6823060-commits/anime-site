"use client";
import { useState } from "react";
import { Send } from "lucide-react";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string | undefined; name: string | null };
}

export function CommentsSection({ episodeId, comments: initial, userId }: { episodeId: string; comments: Comment[]; userId?: string }) {
  const [comments, setComments] = useState(initial);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ episodeId, content: text }),
    });
    if (res.ok) {
      const data = await res.json();
      setComments([data, ...comments]);
      setText("");
    }
    setLoading(false);
  };

  return (
    <div style={{ marginTop: 32 }}>
      <h3 className="section-title" style={{ fontSize: 18 }}>Сэтгэгдэл ({comments.length})</h3>

      {userId ? (
        <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          <input className="input" value={text} onChange={e => setText(e.target.value)} placeholder="Сэтгэгдэл бичих..." onKeyDown={e => e.key === "Enter" && submit()} />
          <button className="btn btn-primary" onClick={submit} disabled={loading || !text.trim()}>
            <Send size={16} />
          </button>
        </div>
      ) : (
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 20 }}>Сэтгэгдэл бичихийн тулд <a href="/auth/login" style={{ color: "var(--accent)" }}>нэвтэрнэ үү</a>.</p>
      )}

      <div>
        {comments.length === 0 && <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Одоогоор сэтгэгдэл алга.</p>}
        {comments.map(c => (
          <div key={c.id} className="comment">
            <div className="avatar" style={{ width: 36, height: 36, fontSize: 12, flexShrink: 0 }}>{c.user.name?.[0]?.toUpperCase() || "U"}</div>
            <div className="comment-body">
              <div className="comment-author">{c.user.name || "Хэрэглэгч"}<span className="comment-time">{new Date(c.createdAt).toLocaleDateString("mn-MN")}</span></div>
              <div className="comment-text">{c.content}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
