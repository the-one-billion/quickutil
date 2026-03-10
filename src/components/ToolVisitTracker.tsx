"use client";
import { useEffect } from "react";

export default function ToolVisitTracker({ slug }: { slug: string }) {
  useEffect(() => {
    try {
      const prev: string[] = JSON.parse(localStorage.getItem("qu_recent") ?? "[]");
      const next = [slug, ...prev.filter(s => s !== slug)].slice(0, 6);
      localStorage.setItem("qu_recent", JSON.stringify(next));
    } catch {}
  }, [slug]);

  return null;
}
