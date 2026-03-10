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

  // Converter (new)
  "csv-json":          dynamic(() => import("@/components/tools/CSVtoJSON"),           { ssr: false }),
  "binary-hex":        dynamic(() => import("@/components/tools/BinaryHex"),           { ssr: false }),

  // Text (new)
  "markdown-html":     dynamic(() => import("@/components/tools/MarkdownHTML"),        { ssr: false }),
  "keyword-density":   dynamic(() => import("@/components/tools/KeywordDensity"),      { ssr: false }),
  "email-validator":   dynamic(() => import("@/components/tools/EmailValidator"),      { ssr: false }),

  // Generator (new)
  "roman-numeral":     dynamic(() => import("@/components/tools/RomanNumeral"),        { ssr: false }),
  "number-to-words":   dynamic(() => import("@/components/tools/NumberToWords"),       { ssr: false }),
  "fake-data":         dynamic(() => import("@/components/tools/FakeDataGenerator"),   { ssr: false }),
  "barcode-generator": dynamic(() => import("@/components/tools/BarcodeGenerator"),   { ssr: false }),

  // Math
  "statistics-calculator": dynamic(() => import("@/components/tools/StatisticsCalculator"), { ssr: false }),
  "compound-interest":     dynamic(() => import("@/components/tools/CompoundInterest"),      { ssr: false }),
  "investment-return":     dynamic(() => import("@/components/tools/InvestmentReturn"),      { ssr: false }),
  "grade-calculator":      dynamic(() => import("@/components/tools/GradeCalculator"),       { ssr: false }),

  // Health
  "calorie-calculator":    dynamic(() => import("@/components/tools/CalorieCalculator"),     { ssr: false }),
  "due-date-calculator":   dynamic(() => import("@/components/tools/DueDateCalculator"),     { ssr: false }),
  "date-difference":       dynamic(() => import("@/components/tools/DateDifference"),        { ssr: false }),

  // Developer (Phase 2)
  "jwt-decoder":   dynamic(() => import("@/components/tools/JWTDecoder"),       { ssr: false }),
  "css-minifier":  dynamic(() => import("@/components/tools/CSSMinifier"),      { ssr: false }),
  "sql-formatter": dynamic(() => import("@/components/tools/SQLFormatter"),     { ssr: false }),
  "url-encoder":   dynamic(() => import("@/components/tools/URLEncoder"),       { ssr: false }),
  "cron-parser":   dynamic(() => import("@/components/tools/CronParser"),       { ssr: false }),
  "html-entities": dynamic(() => import("@/components/tools/HTMLEntities"),     { ssr: false }),

  // Text (Phase 2)
  "readability-checker": dynamic(() => import("@/components/tools/ReadabilityChecker"), { ssr: false }),
  "text-to-slug":        dynamic(() => import("@/components/tools/TextToSlug"),         { ssr: false }),

  // Finance (Phase 2)
  "currency-converter": dynamic(() => import("@/components/tools/CurrencyConverter"), { ssr: false }),
  "vat-calculator":     dynamic(() => import("@/components/tools/VATCalculator"),     { ssr: false }),
  "mortgage-calculator":dynamic(() => import("@/components/tools/MortgageCalculator"),{ ssr: false }),
  "discount-calculator":dynamic(() => import("@/components/tools/DiscountCalculator"),{ ssr: false }),

  // Utility (Phase 2)
  "stopwatch":         dynamic(() => import("@/components/tools/Stopwatch"),              { ssr: false }),
  "countdown-timer":   dynamic(() => import("@/components/tools/CountdownTimer"),         { ssr: false }),
  "aspect-ratio":      dynamic(() => import("@/components/tools/AspectRatioCalculator"),  { ssr: false }),
  "timezone-converter":dynamic(() => import("@/components/tools/TimezoneConverter"),      { ssr: false }),

  // Developer (Phase 3)
  "xml-formatter":  dynamic(() => import("@/components/tools/XMLFormatter"),  { ssr: false }),
  "yaml-json":      dynamic(() => import("@/components/tools/YAMLJSON"),      { ssr: false }),
  "diff-checker":   dynamic(() => import("@/components/tools/DiffChecker"),   { ssr: false }),
  "color-picker":   dynamic(() => import("@/components/tools/ColorPicker"),   { ssr: false }),

  // Fun (Phase 3)
  "coin-flip":      dynamic(() => import("@/components/tools/CoinFlip"),      { ssr: false }),
  "dice-roller":    dynamic(() => import("@/components/tools/DiceRoller"),    { ssr: false }),
  "random-picker":  dynamic(() => import("@/components/tools/RandomPicker"),  { ssr: false }),
  "morse-code":     dynamic(() => import("@/components/tools/MorseCode"),     { ssr: false }),

  // Image (Phase 3)
  "image-to-base64":dynamic(() => import("@/components/tools/ImageToBase64"), { ssr: false }),
  "exif-viewer":    dynamic(() => import("@/components/tools/EXIFViewer"),    { ssr: false }),
  "image-flipper":  dynamic(() => import("@/components/tools/ImageFlipper"),  { ssr: false }),
  "svg-to-png":     dynamic(() => import("@/components/tools/SVGtoPNG"),      { ssr: false }),

  // Health (Phase 3)
  "body-fat-calculator":      dynamic(() => import("@/components/tools/BodyFatCalculator"),      { ssr: false }),
  "sleep-calculator":         dynamic(() => import("@/components/tools/SleepCalculator"),         { ssr: false }),
  "water-intake-calculator":  dynamic(() => import("@/components/tools/WaterIntakeCalculator"),   { ssr: false }),
  "ovulation-calculator":     dynamic(() => import("@/components/tools/OvulationCalculator"),     { ssr: false }),

  // Finance (Phase 3)
  "retirement-calculator":    dynamic(() => import("@/components/tools/RetirementCalculator"),    { ssr: false }),
  "tax-bracket-calculator":   dynamic(() => import("@/components/tools/TaxBracketCalculator"),    { ssr: false }),
  "credit-card-payoff":       dynamic(() => import("@/components/tools/CreditCardPayoff"),        { ssr: false }),
  "inflation-calculator":     dynamic(() => import("@/components/tools/InflationCalculator"),     { ssr: false }),

  // Text (Phase 3)
  "duplicate-remover":dynamic(() => import("@/components/tools/DuplicateRemover"), { ssr: false }),
  "line-sorter":      dynamic(() => import("@/components/tools/LineSorter"),       { ssr: false }),
  "fancy-text":       dynamic(() => import("@/components/tools/FancyText"),        { ssr: false }),
  "text-to-speech":   dynamic(() => import("@/components/tools/TextToSpeech"),     { ssr: false }),
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
