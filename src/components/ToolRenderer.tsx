"use client";
/**
 * ToolRenderer — client component that lazy-loads tool UIs.
 * Must be a client component because next/dynamic with ssr:false
 * is not allowed in Server Components (Next.js 15 rule).
 */
import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Register tool components here as you build them.
// Each is its own JS chunk — only downloaded when the user visits that tool.
const toolComponents: Record<string, React.ComponentType> = {
  "pdf-merge":      dynamic(() => import("@/components/tools/PDFMerge"),      { ssr: false }),
  "image-compress": dynamic(() => import("@/components/tools/ImageCompress"), { ssr: false }),
  "bmi-calculator": dynamic(() => import("@/components/tools/BMICalculator"), { ssr: false }),
  // Add more as you build them:
  // "qr-generator":   dynamic(() => import("@/components/tools/QRGenerator"),  { ssr: false }),
};

interface ToolRendererProps {
  slug: string;
}

export default function ToolRenderer({ slug }: ToolRendererProps) {
  const ToolComponent = toolComponents[slug];

  if (!ToolComponent) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center text-muted-foreground">
        <span className="text-5xl">🚧</span>
        <p className="font-semibold text-lg">Coming Soon</p>
        <p className="text-sm">This tool is under construction. Check back shortly!</p>
        <Link href="/tools">
          <Button variant="outline" size="sm" className="mt-2">
            Browse available tools
          </Button>
        </Link>
      </div>
    );
  }

  return <ToolComponent />;
}
