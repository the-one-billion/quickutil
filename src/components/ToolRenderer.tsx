"use client";
/**
 * ToolRenderer — client component that lazy-loads tool UIs.
 * Must be a client component because next/dynamic with ssr:false
 * is not allowed in Server Components (Next.js 15 rule).
 */
import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const toolComponents: Record<string, React.ComponentType> = {
  // PDF
  "pdf-merge":      dynamic(() => import("@/components/tools/PDFMerge"),             { ssr: false }),
  "pdf-split":      dynamic(() => import("@/components/tools/PDFSplit"),             { ssr: false }),
  "images-to-pdf":  dynamic(() => import("@/components/tools/ImagesToPDF"),          { ssr: false }),

  // Image
  "image-compress": dynamic(() => import("@/components/tools/ImageCompress"),        { ssr: false }),
  "image-resize":   dynamic(() => import("@/components/tools/ImageResize"),          { ssr: false }),
  "image-convert":  dynamic(() => import("@/components/tools/ImageConvert"),         { ssr: false }),
  "image-crop":     dynamic(() => import("@/components/tools/ImageCrop"),            { ssr: false }),
  "image-watermark":dynamic(() => import("@/components/tools/ImageWatermark"),       { ssr: false }),

  // Calculator
  "bmi-calculator":          dynamic(() => import("@/components/tools/BMICalculator"),          { ssr: false }),
  "loan-calculator":         dynamic(() => import("@/components/tools/LoanCalculator"),         { ssr: false }),
  "percentage-calculator":   dynamic(() => import("@/components/tools/PercentageCalculator"),   { ssr: false }),
  "age-calculator":          dynamic(() => import("@/components/tools/AgeCalculator"),          { ssr: false }),
  "tip-calculator":          dynamic(() => import("@/components/tools/TipCalculator"),          { ssr: false }),
  "scientific-calculator":   dynamic(() => import("@/components/tools/ScientificCalculator"),   { ssr: false }),
  "pomodoro":                dynamic(() => import("@/components/tools/PomodoroTimer"),          { ssr: false }),

  // Converter
  "unit-converter":  dynamic(() => import("@/components/tools/UnitConverter"),       { ssr: false }),
  "color-converter": dynamic(() => import("@/components/tools/ColorConverter"),      { ssr: false }),
  "base64":          dynamic(() => import("@/components/tools/Base64Tool"),          { ssr: false }),

  // Text
  "word-counter":  dynamic(() => import("@/components/tools/WordCounter"),           { ssr: false }),
  "case-converter":dynamic(() => import("@/components/tools/CaseConverter"),         { ssr: false }),
  "text-diff":     dynamic(() => import("@/components/tools/TextDiff"),              { ssr: false }),
  "lorem-ipsum":   dynamic(() => import("@/components/tools/LoremIpsum"),            { ssr: false }),

  // Generator
  "qr-generator":    dynamic(() => import("@/components/tools/QRGenerator"),        { ssr: false }),
  "uuid-generator":  dynamic(() => import("@/components/tools/UUIDGenerator"),      { ssr: false }),
  "color-palette":   dynamic(() => import("@/components/tools/ColorPalette"),       { ssr: false }),

  // Security
  "password-generator": dynamic(() => import("@/components/tools/PasswordGenerator"), { ssr: false }),
  "hash-generator":     dynamic(() => import("@/components/tools/HashGenerator"),      { ssr: false }),

  // Developer
  "json-formatter": dynamic(() => import("@/components/tools/JSONFormatter"),       { ssr: false }),
  "regex-tester":   dynamic(() => import("@/components/tools/RegexTester"),         { ssr: false }),
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
