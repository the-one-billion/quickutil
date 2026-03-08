"use client";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

type AdSlotSize = "leaderboard" | "rectangle" | "banner" | "skyscraper";

interface AdSlotProps {
  size: AdSlotSize;
  className?: string;
  adSlotId?: string;   // Google AdSense data-ad-slot value
  adClient?: string;   // Google AdSense data-ad-client value (publisher ID)
}

const sizeMap: Record<AdSlotSize, { w: number; h: number; label: string }> = {
  leaderboard: { w: 728, h: 90,  label: "Leaderboard (728×90)" },
  rectangle:   { w: 300, h: 250, label: "Medium Rectangle (300×250)" },
  banner:      { w: 320, h: 50,  label: "Mobile Banner (320×50)" },
  skyscraper:  { w: 160, h: 600, label: "Wide Skyscraper (160×600)" },
};

/**
 * AdSlot – drop-in AdSense slot wrapper.
 *
 * Development: renders a grey placeholder with dimensions.
 * Production: inject <ins class="adsbygoogle"> and call adsbygoogle.push({}).
 *
 * Usage:
 *   <AdSlot size="leaderboard" adClient="ca-pub-XXXXXXXX" adSlotId="1234567890" />
 */
export default function AdSlot({ size, className, adSlotId, adClient }: AdSlotProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { w, h, label } = sizeMap[size];
  const isProd = process.env.NODE_ENV === "production";

  useEffect(() => {
    if (!isProd || !adSlotId || !adClient) return;
    // Push ad after mount; AdSense script must be loaded in layout.tsx
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {
      // AdSense not loaded yet — silently ignore during SSR/edge cases
    }
  }, [isProd, adSlotId, adClient]);

  if (isProd && adSlotId && adClient) {
    return (
      <div className={cn("flex items-center justify-center overflow-hidden", className)}>
        <ins
          className="adsbygoogle"
          style={{ display: "block", width: w, height: h }}
          data-ad-client={adClient}
          data-ad-slot={adSlotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  // Dev placeholder
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 text-xs text-muted-foreground select-none",
        className
      )}
      style={{ minWidth: w, minHeight: h }}
      aria-label="Advertisement"
    >
      <span>Ad · {label}</span>
    </div>
  );
}
