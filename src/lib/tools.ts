export type ToolCategory =
  | "PDF"
  | "Image"
  | "Calculator"
  | "Text"
  | "Converter"
  | "Generator"
  | "Security"
  | "Developer";

export interface Tool {
  slug: string;
  name: string;
  description: string;
  metaDescription?: string;  // SEO-optimised, 140–160 chars
  category: ToolCategory;
  icon: string;        // Lucide icon name
  keywords: string[];
  isNew?: boolean;
  isPro?: boolean;
}

export const tools: Tool[] = [
  // ─── PDF ─────────────────────────────────────────────────────────────────
  {
    slug: "pdf-merge",
    name: "PDF Merge",
    description: "Combine multiple PDF files into one in seconds.",
    metaDescription: "Free online PDF merger — combine multiple PDF files into one document instantly. No upload required, 100% in-browser. Drag, reorder, and merge PDFs securely.",
    category: "PDF",
    icon: "FilePlus2",
    keywords: ["pdf", "merge", "combine", "join"],
  },
  {
    slug: "pdf-split",
    name: "PDF Split",
    description: "Extract pages or split a PDF into multiple files.",
    metaDescription: "Split a PDF into individual pages or extract a custom page range — free and in-browser. No file upload needed. Download split PDFs instantly.",
    category: "PDF",
    icon: "Scissors",
    keywords: ["pdf", "split", "extract", "pages"],
  },
  {
    slug: "pdf-to-images",
    name: "PDF to Images",
    description: "Convert each PDF page to a high-quality PNG/JPG.",
    metaDescription: "Convert PDF pages to high-quality PNG or JPG images for free. Runs entirely in your browser — no upload, no registration. Fast PDF to image converter.",
    category: "PDF",
    icon: "Image",
    keywords: ["pdf", "image", "convert", "png", "jpg"],
  },
  {
    slug: "images-to-pdf",
    name: "Images to PDF",
    description: "Turn JPG/PNG images into a single PDF document.",
    metaDescription: "Convert JPG, PNG, or WebP images into a PDF document online for free. Reorder pages, choose A4 or Letter size, and download instantly — no upload needed.",
    category: "PDF",
    icon: "FileImage",
    keywords: ["image", "pdf", "convert"],
  },

  // ─── Image ───────────────────────────────────────────────────────────────
  {
    slug: "image-compress",
    name: "Image Compress",
    description: "Reduce image file size without visible quality loss.",
    metaDescription: "Compress JPG, PNG, and WebP images online for free — reduce file size by up to 90% without visible quality loss. Batch compression, fully in-browser.",
    category: "Image",
    icon: "Minimize2",
    keywords: ["image", "compress", "reduce", "optimize", "jpg", "png", "webp"],
  },
  {
    slug: "image-resize",
    name: "Image Resize",
    description: "Resize images to any dimension or percentage.",
    metaDescription: "Resize images online for free — enter exact pixel dimensions or a percentage, lock aspect ratio, and download instantly. Supports JPG, PNG, and WebP.",
    category: "Image",
    icon: "Expand",
    keywords: ["image", "resize", "scale", "dimension"],
  },
  {
    slug: "image-crop",
    name: "Image Crop",
    description: "Crop images to a custom aspect ratio or pixel size.",
    metaDescription: "Crop images online to any size or aspect ratio — 1:1, 4:3, 16:9, or freeform. Free in-browser image cropper with instant PNG download.",
    category: "Image",
    icon: "Crop",
    keywords: ["image", "crop", "trim"],
  },
  {
    slug: "image-convert",
    name: "Image Convert",
    description: "Convert between JPG, PNG, WebP, GIF, and more.",
    metaDescription: "Convert images between JPG, PNG, WebP, and GIF formats for free online. Adjust quality, preview before download. No upload — runs entirely in your browser.",
    category: "Image",
    icon: "RefreshCw",
    keywords: ["image", "convert", "format", "jpg", "png", "webp", "gif"],
  },
  {
    slug: "image-watermark",
    name: "Image Watermark",
    description: "Add a text or logo watermark to your images.",
    metaDescription: "Add a custom text watermark to your images online — choose position, opacity, font size, color, and rotation. Free, in-browser, no upload needed.",
    category: "Image",
    icon: "Stamp",
    keywords: ["image", "watermark", "logo", "text"],
    isNew: true,
  },
  {
    slug: "bg-remover",
    name: "Background Remover",
    description: "Remove image backgrounds 100% in-browser.",
    metaDescription: "Remove image backgrounds automatically for free — get a clean transparent PNG in seconds. 100% in-browser, no upload, no sign-up required.",
    category: "Image",
    icon: "Eraser",
    keywords: ["background", "remove", "transparent", "png"],
    isNew: true,
  },

  // ─── Calculator ──────────────────────────────────────────────────────────
  {
    slug: "bmi-calculator",
    name: "BMI Calculator",
    description: "Calculate your Body Mass Index with metric or imperial units.",
    metaDescription: "Free BMI calculator — calculate your Body Mass Index using metric or imperial units. Get WHO weight classification, healthy range, and visual gauge instantly.",
    category: "Calculator",
    icon: "Weight",
    keywords: ["bmi", "body mass index", "health", "weight"],
  },
  {
    slug: "loan-calculator",
    name: "Loan Calculator",
    description: "Compute monthly payments, interest, and amortization.",
    metaDescription: "Free loan and mortgage calculator — compute monthly payments, total interest, and full amortization schedule. Supports any loan amount, rate, and term.",
    category: "Calculator",
    icon: "Landmark",
    keywords: ["loan", "mortgage", "interest", "payment", "finance"],
  },
  {
    slug: "percentage-calculator",
    name: "Percentage Calculator",
    description: "Find percentages, increase/decrease, and ratios instantly.",
    metaDescription: "Free percentage calculator — find X% of a number, what percentage one number is of another, and calculate percentage increase or decrease instantly.",
    category: "Calculator",
    icon: "Percent",
    keywords: ["percentage", "percent", "ratio", "calculator"],
  },
  {
    slug: "age-calculator",
    name: "Age Calculator",
    description: "Calculate exact age in years, months, days, and hours.",
    metaDescription: "Calculate your exact age in years, months, days, hours, and minutes. Find your next birthday countdown, day of birth, zodiac sign, and more — free online.",
    category: "Calculator",
    icon: "CalendarDays",
    keywords: ["age", "birthday", "date", "calculator"],
  },
  {
    slug: "tip-calculator",
    name: "Tip Calculator",
    description: "Split bills and calculate tips for any group size.",
    metaDescription: "Free tip calculator — calculate tip amount, total bill, and per-person split for any group size. Choose from preset tip percentages or enter a custom amount.",
    category: "Calculator",
    icon: "Receipt",
    keywords: ["tip", "bill", "split", "restaurant"],
  },
  {
    slug: "scientific-calculator",
    name: "Scientific Calculator",
    description: "Full-featured scientific calculator with history.",
    metaDescription: "Free online scientific calculator with sin, cos, tan, log, sqrt, exponents, and full calculation history. Supports DEG/RAD mode and keyboard input.",
    category: "Calculator",
    icon: "Calculator",
    keywords: ["calculator", "scientific", "math", "trig"],
  },

  // ─── Converter ───────────────────────────────────────────────────────────
  {
    slug: "unit-converter",
    name: "Unit Converter",
    description: "Convert length, weight, temperature, speed, and more.",
    metaDescription: "Free unit converter — convert length, weight, temperature, speed, area, volume, and data units instantly. Supports metric and imperial systems.",
    category: "Converter",
    icon: "ArrowLeftRight",
    keywords: ["unit", "convert", "length", "weight", "temperature"],
  },
  {
    slug: "color-converter",
    name: "Color Converter",
    description: "Convert between HEX, RGB, HSL, HSV, and CMYK.",
    metaDescription: "Free color converter — instantly convert colors between HEX, RGB, HSL, and CMYK formats. Live color preview with one-click copy for each format.",
    category: "Converter",
    icon: "Palette",
    keywords: ["color", "hex", "rgb", "hsl", "convert"],
  },
  {
    slug: "base64",
    name: "Base64 Encode/Decode",
    description: "Encode or decode Base64 strings and files.",
    metaDescription: "Free Base64 encoder and decoder online — encode text or files to Base64, or decode Base64 strings back to plain text. Supports UTF-8 and binary files.",
    category: "Converter",
    icon: "Binary",
    keywords: ["base64", "encode", "decode"],
  },
  {
    slug: "json-formatter",
    name: "JSON Formatter",
    description: "Validate, format, and minify JSON with syntax highlighting.",
    metaDescription: "Free online JSON formatter, validator, and minifier — pretty-print JSON with 2-space indentation or minify for production. Instant error detection with line numbers.",
    category: "Developer",
    icon: "Braces",
    keywords: ["json", "format", "validate", "minify", "pretty"],
  },

  // ─── Text ─────────────────────────────────────────────────────────────────
  {
    slug: "word-counter",
    name: "Word Counter",
    description: "Count words, characters, sentences, and reading time.",
    metaDescription: "Free online word counter — count words, characters (with and without spaces), sentences, paragraphs, and estimated reading time. Updates live as you type.",
    category: "Text",
    icon: "FileText",
    keywords: ["word", "count", "character", "text", "reading time"],
  },
  {
    slug: "case-converter",
    name: "Case Converter",
    description: "Convert text to UPPER, lower, Title, or camelCase.",
    metaDescription: "Free text case converter — instantly convert text to UPPERCASE, lowercase, Title Case, Sentence case, camelCase, snake_case, or kebab-case online.",
    category: "Text",
    icon: "CaseSensitive",
    keywords: ["case", "upper", "lower", "title", "camel", "text"],
  },
  {
    slug: "text-diff",
    name: "Text Diff Checker",
    description: "Compare two texts and highlight differences.",
    metaDescription: "Free online text diff tool — compare two texts side by side and highlight added, removed, and changed lines. Great for spotting edits in documents or code.",
    category: "Text",
    icon: "Diff",
    keywords: ["diff", "compare", "text", "difference"],
  },
  {
    slug: "lorem-ipsum",
    name: "Lorem Ipsum Generator",
    description: "Generate placeholder text in paragraphs or words.",
    metaDescription: "Free Lorem Ipsum generator — generate placeholder text by paragraphs, sentences, or words. Optionally start with the classic 'Lorem ipsum dolor sit amet' opening.",
    category: "Generator",
    icon: "AlignLeft",
    keywords: ["lorem", "ipsum", "placeholder", "text", "generator"],
  },

  // ─── Generator ────────────────────────────────────────────────────────────
  {
    slug: "qr-generator",
    name: "QR Code Generator",
    description: "Generate QR codes for URLs, text, email, or Wi-Fi.",
    metaDescription: "Free QR code generator — create QR codes for URLs, text, email, or Wi-Fi credentials. Customize size, colors, and error correction. Download as PNG or SVG.",
    category: "Generator",
    icon: "QrCode",
    keywords: ["qr", "code", "generator", "scan", "barcode"],
  },
  {
    slug: "password-generator",
    name: "Password Generator",
    description: "Create strong, secure passwords with custom rules.",
    metaDescription: "Free strong password generator — create secure random passwords with custom length, uppercase, numbers, and symbols. Includes password strength indicator.",
    category: "Security",
    icon: "KeyRound",
    keywords: ["password", "generator", "secure", "random"],
  },
  {
    slug: "uuid-generator",
    name: "UUID Generator",
    description: "Generate v4 UUIDs in bulk for development use.",
    metaDescription: "Free UUID v4 generator — generate up to 100 UUIDs instantly in lowercase, uppercase, or no-dash format. Copy individually or all at once. No install needed.",
    category: "Generator",
    icon: "Hash",
    keywords: ["uuid", "guid", "generator", "unique", "id"],
  },
  {
    slug: "color-palette",
    name: "Color Palette Generator",
    description: "Generate harmonious color palettes from any base color.",
    metaDescription: "Free color palette generator — create complementary, triadic, analogous, and monochromatic palettes from any base color. Export as CSS variables instantly.",
    category: "Generator",
    icon: "Pipette",
    keywords: ["color", "palette", "generate", "design"],
    isNew: true,
  },
  {
    slug: "pomodoro",
    name: "Pomodoro Timer",
    description: "Focus timer with 25-min work sessions and break alerts.",
    metaDescription: "Free Pomodoro timer online — 25-minute focus sessions with short and long break intervals. Customizable durations, audio alerts, and session tracking.",
    category: "Calculator",
    icon: "Timer",
    keywords: ["pomodoro", "timer", "focus", "productivity"],
  },

  // ─── Security ────────────────────────────────────────────────────────────
  {
    slug: "hash-generator",
    name: "Hash Generator",
    description: "Generate MD5, SHA-1, SHA-256, and SHA-512 hashes.",
    metaDescription: "Free hash generator — compute MD5, SHA-1, SHA-256, and SHA-512 hashes for text or files online. Supports HMAC. All processing done in your browser.",
    category: "Security",
    icon: "ShieldCheck",
    keywords: ["hash", "md5", "sha", "sha256", "security", "checksum"],
  },

  // ─── Developer ───────────────────────────────────────────────────────────
  {
    slug: "regex-tester",
    name: "Regex Tester",
    description: "Write, test, and debug regular expressions live.",
    metaDescription: "Free online regex tester — write and test regular expressions with live match highlighting, match list, group captures, and flag toggles (g, i, m, s, u).",
    category: "Developer",
    icon: "Code2",
    keywords: ["regex", "regular expression", "test", "developer"],
  },
  {
    slug: "css-minifier",
    name: "CSS Minifier",
    description: "Minify CSS for faster page loads.",
    metaDescription: "Free online CSS minifier — remove whitespace, comments, and redundant code to shrink your CSS file size for faster page loads. Instant results, no upload.",
    category: "Developer",
    icon: "Zap",
    keywords: ["css", "minify", "compress", "developer"],
  },
];

export const categories: ToolCategory[] = [
  "PDF",
  "Image",
  "Calculator",
  "Converter",
  "Text",
  "Generator",
  "Security",
  "Developer",
];

export const categoryColors: Record<ToolCategory, string> = {
  PDF:        "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  Image:      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  Calculator: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Converter:  "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Text:       "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Generator:  "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  Security:   "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  Developer:  "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}

export function getToolsByCategory(category: ToolCategory): Tool[] {
  return tools.filter((t) => t.category === category);
}

export function searchTools(query: string): Tool[] {
  const q = query.toLowerCase().trim();
  if (!q) return tools;
  return tools.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.keywords.some((k) => k.includes(q))
  );
}
