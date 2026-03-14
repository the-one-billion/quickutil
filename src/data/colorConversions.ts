// ─── Types ────────────────────────────────────────────────────────────────────

export type ColorModel = "hex" | "rgb" | "hsl" | "cmyk";

export interface ColorModelDef {
  id: ColorModel;
  label: string;         // "HEX"
  labelFull: string;     // "Hexadecimal"
  description: string;
  inputPlaceholder: string;
  exampleValue: string;  // in this model's format
  cssUsage: string;      // how it appears in CSS
}

export interface ColorConversionPair {
  slug: string;           // "rgb-to-hex"
  fromModel: ColorModel;
  toModel: ColorModel;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  formula: string;        // human-readable formula text
  inverseSlug: string;
}

// ─── Color model definitions ──────────────────────────────────────────────────

export const colorModels: Record<ColorModel, ColorModelDef> = {
  hex: {
    id: "hex",
    label: "HEX",
    labelFull: "Hexadecimal",
    description:
      "A 6-digit hex code (#RRGGBB) representing red, green, and blue channels in base-16. The most widely used color format in web development and CSS.",
    inputPlaceholder: "#6366f1",
    exampleValue: "#6366f1",
    cssUsage: "color: #6366f1",
  },
  rgb: {
    id: "rgb",
    label: "RGB",
    labelFull: "Red, Green, Blue",
    description:
      "Three integer values (0–255) for red, green, and blue light. The native color model for screens, monitors, and digital displays.",
    inputPlaceholder: "99, 102, 241",
    exampleValue: "rgb(99, 102, 241)",
    cssUsage: "color: rgb(99, 102, 241)",
  },
  hsl: {
    id: "hsl",
    label: "HSL",
    labelFull: "Hue, Saturation, Lightness",
    description:
      "Hue (0–360°), Saturation (0–100%), and Lightness (0–100%). Designed to be intuitive for humans — great for adjusting color tones in CSS.",
    inputPlaceholder: "239, 84%, 67%",
    exampleValue: "hsl(239, 84%, 67%)",
    cssUsage: "color: hsl(239, 84%, 67%)",
  },
  cmyk: {
    id: "cmyk",
    label: "CMYK",
    labelFull: "Cyan, Magenta, Yellow, Key (Black)",
    description:
      "Four percentages for Cyan, Magenta, Yellow, and Black ink. The standard color model for print design and professional publishing.",
    inputPlaceholder: "59%, 58%, 0%, 5%",
    exampleValue: "cmyk(59%, 58%, 0%, 5%)",
    cssUsage: "Not natively supported in CSS (convert to HEX first)",
  },
};

// ─── Color math ───────────────────────────────────────────────────────────────

interface RGB { r: number; g: number; b: number }
interface HSL { h: number; s: number; l: number }
interface CMYK { c: number; m: number; y: number; k: number }

export function hexToRgb(hex: string): RGB | null {
  const clean = hex.replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

export function rgbToHex({ r, g, b }: RGB): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return "#" + [r, g, b].map((v) => clamp(v).toString(16).padStart(2, "0")).join("");
}

export function rgbToHsl({ r, g, b }: RGB): HSL {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn)      h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else                 h = ((rn - gn) / d + 4) / 6;
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToRgb({ h, s, l }: HSL): RGB {
  const hn = h / 360, sn = s / 100, ln = l / 100;
  if (sn === 0) {
    const v = Math.round(ln * 255);
    return { r: v, g: v, b: v };
  }
  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p = 2 * ln - q;
  const hue2rgb = (t: number): number => {
    let tt = t < 0 ? t + 1 : t > 1 ? t - 1 : t;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  return {
    r: Math.round(hue2rgb(hn + 1 / 3) * 255),
    g: Math.round(hue2rgb(hn) * 255),
    b: Math.round(hue2rgb(hn - 1 / 3) * 255),
  };
}

export function rgbToCmyk({ r, g, b }: RGB): CMYK {
  if (r === 0 && g === 0 && b === 0) return { c: 0, m: 0, y: 0, k: 100 };
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const k = 1 - Math.max(rn, gn, bn);
  const c = (1 - rn - k) / (1 - k);
  const m = (1 - gn - k) / (1 - k);
  const y = (1 - bn - k) / (1 - k);
  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100),
  };
}

export function cmykToRgb({ c, m, y, k }: CMYK): RGB {
  const kn = k / 100;
  return {
    r: Math.round(255 * (1 - c / 100) * (1 - kn)),
    g: Math.round(255 * (1 - m / 100) * (1 - kn)),
    b: Math.round(255 * (1 - y / 100) * (1 - kn)),
  };
}

/** Convert any color model to an RGB triple (used as pivot for all conversions). */
export function toRgb(model: ColorModel, raw: string): RGB | null {
  switch (model) {
    case "hex": return hexToRgb(raw);
    case "rgb": {
      const parts = raw.replace(/rgb\(|\)/gi, "").split(",").map((s) => parseInt(s.trim(), 10));
      if (parts.length < 3 || parts.some(isNaN)) return null;
      return { r: parts[0], g: parts[1], b: parts[2] };
    }
    case "hsl": {
      const clean = raw.replace(/hsl\(|\)|%/gi, "");
      const parts = clean.split(",").map((s) => parseFloat(s.trim()));
      if (parts.length < 3 || parts.some(isNaN)) return null;
      return hslToRgb({ h: parts[0], s: parts[1], l: parts[2] });
    }
    case "cmyk": {
      const clean = raw.replace(/cmyk\(|\)|%/gi, "");
      const parts = clean.split(",").map((s) => parseFloat(s.trim()));
      if (parts.length < 4 || parts.some(isNaN)) return null;
      return cmykToRgb({ c: parts[0], m: parts[1], y: parts[2], k: parts[3] });
    }
  }
}

/** Convert an RGB triple to any color model's string representation. */
export function fromRgb(model: ColorModel, rgb: RGB): string {
  switch (model) {
    case "hex":  return rgbToHex(rgb).toUpperCase();
    case "rgb":  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    case "hsl": {
      const { h, s, l } = rgbToHsl(rgb);
      return `hsl(${h}, ${s}%, ${l}%)`;
    }
    case "cmyk": {
      const { c, m, y, k } = rgbToCmyk(rgb);
      return `cmyk(${c}%, ${m}%, ${y}%, ${k}%)`;
    }
  }
}

// ─── Common reference colors ──────────────────────────────────────────────────

export const COMMON_COLORS: { name: string; rgb: RGB }[] = [
  { name: "Red",      rgb: { r: 255, g: 0,   b: 0   } },
  { name: "Green",    rgb: { r: 0,   g: 128, b: 0   } },
  { name: "Blue",     rgb: { r: 0,   g: 0,   b: 255 } },
  { name: "White",    rgb: { r: 255, g: 255, b: 255 } },
  { name: "Black",    rgb: { r: 0,   g: 0,   b: 0   } },
  { name: "Orange",   rgb: { r: 255, g: 165, b: 0   } },
  { name: "Purple",   rgb: { r: 128, g: 0,   b: 128 } },
  { name: "Yellow",   rgb: { r: 255, g: 255, b: 0   } },
  { name: "Cyan",     rgb: { r: 0,   g: 255, b: 255 } },
  { name: "Magenta",  rgb: { r: 255, g: 0,   b: 255 } },
  { name: "Gray",     rgb: { r: 128, g: 128, b: 128 } },
  { name: "Pink",     rgb: { r: 255, g: 192, b: 203 } },
];

// ─── Formula text per pair ────────────────────────────────────────────────────

const FORMULAS: Partial<Record<string, string>> = {
  "rgb-to-hex":  "Hex = '#' + toHex(R) + toHex(G) + toHex(B)  where toHex(n) converts 0–255 to a 2-digit base-16 string",
  "hex-to-rgb":  "R = parseInt(hex[1..2], 16)  |  G = parseInt(hex[3..4], 16)  |  B = parseInt(hex[5..6], 16)",
  "rgb-to-hsl":  "L = (max + min) / 2  |  S = (max − min) / (1 − |2L − 1|)  |  H = 60° × sector offset",
  "hsl-to-rgb":  "C = (1 − |2L − 1|) × S  |  X = C × (1 − |H/60 mod 2 − 1|)  |  m = L − C/2, then map (R,G,B) = (C,X,0)+m",
  "rgb-to-cmyk": "K = 1 − max(R,G,B) / 255  |  C = (1 − R/255 − K) / (1 − K)  |  M = (1 − G/255 − K) / (1 − K)  |  Y = (1 − B/255 − K) / (1 − K)",
  "cmyk-to-rgb": "R = 255 × (1 − C) × (1 − K)  |  G = 255 × (1 − M) × (1 − K)  |  B = 255 × (1 − Y) × (1 − K)",
  "hex-to-hsl":  "Step 1: HEX → RGB (parse each byte).  Step 2: RGB → HSL (normalize, find max/min, compute H/S/L)",
  "hsl-to-hex":  "Step 1: HSL → RGB (hue sector formula).  Step 2: RGB → HEX (each channel to 2-digit hex)",
  "hex-to-cmyk": "Step 1: HEX → RGB.  Step 2: K = 1 − max(R,G,B)/255.  Then C = (1−R/255−K)/(1−K), similarly M and Y",
  "cmyk-to-hex": "Step 1: CMYK → RGB: R = 255×(1−C)×(1−K), etc.  Step 2: RGB → HEX",
  "hsl-to-cmyk": "Step 1: HSL → RGB.  Step 2: RGB → CMYK",
  "cmyk-to-hsl": "Step 1: CMYK → RGB.  Step 2: RGB → HSL",
};

// ─── Pair generation ──────────────────────────────────────────────────────────

const models: ColorModel[] = ["hex", "rgb", "hsl", "cmyk"];

function buildPair(from: ColorModel, to: ColorModel): ColorConversionPair {
  const f = colorModels[from];
  const t = colorModels[to];
  const slug = `${from}-to-${to}`;
  const inverseSlug = `${to}-to-${from}`;

  return {
    slug,
    fromModel: from,
    toModel: to,
    inverseSlug,
    h1: `${f.label} to ${t.label} Color Converter`,
    metaTitle: `${f.label} to ${t.label} Converter — ${f.labelFull} to ${t.labelFull} | QuickUtil`,
    metaDescription: `Convert ${f.label} to ${t.label} color codes instantly. Free online ${f.label.toLowerCase()}-to-${t.label.toLowerCase()} converter with formula, color picker, and ${COMMON_COLORS.length} common color examples. No signup required.`,
    formula: FORMULAS[slug] ?? `Convert from ${f.labelFull} to ${t.labelFull} by pivoting through the RGB color space.`,
  };
}

export const colorConversionPairs: ColorConversionPair[] = models.flatMap((from) =>
  models.filter((to) => to !== from).map((to) => buildPair(from, to))
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getColorPairBySlug(slug: string): ColorConversionPair | undefined {
  return colorConversionPairs.find((p) => p.slug === slug);
}

export function getRelatedColorPairs(pair: ColorConversionPair, limit = 6): ColorConversionPair[] {
  return colorConversionPairs
    .filter(
      (p) =>
        p.slug !== pair.slug &&
        p.slug !== pair.inverseSlug &&
        (p.fromModel === pair.fromModel || p.toModel === pair.toModel)
    )
    .slice(0, limit);
}
