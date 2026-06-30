"use client";
import { useRef } from "react";

export function VideoPlayer({ videoUrl }: { videoUrl: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  return (
    <div className="video-container">
      <video
        ref={ref}
        src={videoUrl}
        controls
        autoPlay={false}
        style={{ width: "100%", display: "block", maxHeight: 540, background: "#000" }}
      >
        Таны хөтөч видео дэмждэггүй байна.
      </video>
    </div>
  );
}
