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
    category: "PDF",
    icon: "FilePlus2",
    keywords: ["pdf", "merge", "combine", "join"],
  },
  {
    slug: "pdf-split",
    name: "PDF Split",
    description: "Extract pages or split a PDF into multiple files.",
    category: "PDF",
    icon: "Scissors",
    keywords: ["pdf", "split", "extract", "pages"],
  },
  {
    slug: "pdf-to-images",
    name: "PDF to Images",
    description: "Convert each PDF page to a high-quality PNG/JPG.",
    category: "PDF",
    icon: "Image",
    keywords: ["pdf", "image", "convert", "png", "jpg"],
  },
  {
    slug: "images-to-pdf",
    name: "Images to PDF",
    description: "Turn JPG/PNG images into a single PDF document.",
    category: "PDF",
    icon: "FileImage",
    keywords: ["image", "pdf", "convert"],
  },

  // ─── Image ───────────────────────────────────────────────────────────────
  {
    slug: "image-compress",
    name: "Image Compress",
    description: "Reduce image file size without visible quality loss.",
    category: "Image",
    icon: "Minimize2",
    keywords: ["image", "compress", "reduce", "optimize", "jpg", "png", "webp"],
  },
  {
    slug: "image-resize",
    name: "Image Resize",
    description: "Resize images to any dimension or percentage.",
    category: "Image",
    icon: "Expand",
    keywords: ["image", "resize", "scale", "dimension"],
  },
  {
    slug: "image-crop",
    name: "Image Crop",
    description: "Crop images to a custom aspect ratio or pixel size.",
    category: "Image",
    icon: "Crop",
    keywords: ["image", "crop", "trim"],
  },
  {
    slug: "image-convert",
    name: "Image Convert",
    description: "Convert between JPG, PNG, WebP, GIF, and more.",
    category: "Image",
    icon: "RefreshCw",
    keywords: ["image", "convert", "format", "jpg", "png", "webp", "gif"],
  },
  {
    slug: "image-watermark",
    name: "Image Watermark",
    description: "Add a text or logo watermark to your images.",
    category: "Image",
    icon: "Stamp",
    keywords: ["image", "watermark", "logo", "text"],
    isNew: true,
  },
  {
    slug: "bg-remover",
    name: "Background Remover",
    description: "Remove image backgrounds 100% in-browser.",
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
    category: "Calculator",
    icon: "Weight",
    keywords: ["bmi", "body mass index", "health", "weight"],
  },
  {
    slug: "loan-calculator",
    name: "Loan Calculator",
    description: "Compute monthly payments, interest, and amortization.",
    category: "Calculator",
    icon: "Landmark",
    keywords: ["loan", "mortgage", "interest", "payment", "finance"],
  },
  {
    slug: "percentage-calculator",
    name: "Percentage Calculator",
    description: "Find percentages, increase/decrease, and ratios instantly.",
    category: "Calculator",
    icon: "Percent",
    keywords: ["percentage", "percent", "ratio", "calculator"],
  },
  {
    slug: "age-calculator",
    name: "Age Calculator",
    description: "Calculate exact age in years, months, days, and hours.",
    category: "Calculator",
    icon: "CalendarDays",
    keywords: ["age", "birthday", "date", "calculator"],
  },
  {
    slug: "tip-calculator",
    name: "Tip Calculator",
    description: "Split bills and calculate tips for any group size.",
    category: "Calculator",
    icon: "Receipt",
    keywords: ["tip", "bill", "split", "restaurant"],
  },
  {
    slug: "scientific-calculator",
    name: "Scientific Calculator",
    description: "Full-featured scientific calculator with history.",
    category: "Calculator",
    icon: "Calculator",
    keywords: ["calculator", "scientific", "math", "trig"],
  },

  // ─── Converter ───────────────────────────────────────────────────────────
  {
    slug: "unit-converter",
    name: "Unit Converter",
    description: "Convert length, weight, temperature, speed, and more.",
    category: "Converter",
    icon: "ArrowLeftRight",
    keywords: ["unit", "convert", "length", "weight", "temperature"],
  },
  {
    slug: "color-converter",
    name: "Color Converter",
    description: "Convert between HEX, RGB, HSL, HSV, and CMYK.",
    category: "Converter",
    icon: "Palette",
    keywords: ["color", "hex", "rgb", "hsl", "convert"],
  },
  {
    slug: "base64",
    name: "Base64 Encode/Decode",
    description: "Encode or decode Base64 strings and files.",
    category: "Converter",
    icon: "Binary",
    keywords: ["base64", "encode", "decode"],
  },
  {
    slug: "json-formatter",
    name: "JSON Formatter",
    description: "Validate, format, and minify JSON with syntax highlighting.",
    category: "Developer",
    icon: "Braces",
    keywords: ["json", "format", "validate", "minify", "pretty"],
  },

  // ─── Text ─────────────────────────────────────────────────────────────────
  {
    slug: "word-counter",
    name: "Word Counter",
    description: "Count words, characters, sentences, and reading time.",
    category: "Text",
    icon: "FileText",
    keywords: ["word", "count", "character", "text", "reading time"],
  },
  {
    slug: "case-converter",
    name: "Case Converter",
    description: "Convert text to UPPER, lower, Title, or camelCase.",
    category: "Text",
    icon: "CaseSensitive",
    keywords: ["case", "upper", "lower", "title", "camel", "text"],
  },
  {
    slug: "text-diff",
    name: "Text Diff Checker",
    description: "Compare two texts and highlight differences.",
    category: "Text",
    icon: "Diff",
    keywords: ["diff", "compare", "text", "difference"],
  },
  {
    slug: "lorem-ipsum",
    name: "Lorem Ipsum Generator",
    description: "Generate placeholder text in paragraphs or words.",
    category: "Generator",
    icon: "AlignLeft",
    keywords: ["lorem", "ipsum", "placeholder", "text", "generator"],
  },

  // ─── Generator ────────────────────────────────────────────────────────────
  {
    slug: "qr-generator",
    name: "QR Code Generator",
    description: "Generate QR codes for URLs, text, email, or Wi-Fi.",
    category: "Generator",
    icon: "QrCode",
    keywords: ["qr", "code", "generator", "scan", "barcode"],
  },
  {
    slug: "password-generator",
    name: "Password Generator",
    description: "Create strong, secure passwords with custom rules.",
    category: "Security",
    icon: "KeyRound",
    keywords: ["password", "generator", "secure", "random"],
  },
  {
    slug: "uuid-generator",
    name: "UUID Generator",
    description: "Generate v4 UUIDs in bulk for development use.",
    category: "Generator",
    icon: "Hash",
    keywords: ["uuid", "guid", "generator", "unique", "id"],
  },
  {
    slug: "color-palette",
    name: "Color Palette Generator",
    description: "Generate harmonious color palettes from any base color.",
    category: "Generator",
    icon: "Pipette",
    keywords: ["color", "palette", "generate", "design"],
    isNew: true,
  },
  {
    slug: "pomodoro",
    name: "Pomodoro Timer",
    description: "Focus timer with 25-min work sessions and break alerts.",
    category: "Calculator",
    icon: "Timer",
    keywords: ["pomodoro", "timer", "focus", "productivity"],
  },

  // ─── Security ────────────────────────────────────────────────────────────
  {
    slug: "hash-generator",
    name: "Hash Generator",
    description: "Generate MD5, SHA-1, SHA-256, and SHA-512 hashes.",
    category: "Security",
    icon: "ShieldCheck",
    keywords: ["hash", "md5", "sha", "sha256", "security", "checksum"],
  },

  // ─── Developer ───────────────────────────────────────────────────────────
  {
    slug: "regex-tester",
    name: "Regex Tester",
    description: "Write, test, and debug regular expressions live.",
    category: "Developer",
    icon: "Code2",
    keywords: ["regex", "regular expression", "test", "developer"],
  },
  {
    slug: "css-minifier",
    name: "CSS Minifier",
    description: "Minify CSS for faster page loads.",
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
