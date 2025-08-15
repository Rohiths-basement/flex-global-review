"use client";
import { useEffect } from "react";

export function EmbedResizer() {
  useEffect(() => {
    const post = () => {
      const height = document.documentElement.scrollHeight || document.body.scrollHeight || 0;
      window.parent?.postMessage({ type: "flex-reviews:height", height }, "*");
    };

    post();
    const ro = new ResizeObserver(() => post());
    ro.observe(document.body);
    const onLoad = () => post();
    window.addEventListener("load", onLoad);

    return () => {
      try { ro.disconnect(); } catch {}
      window.removeEventListener("load", onLoad);
    };
  }, []);

  return null;
}
