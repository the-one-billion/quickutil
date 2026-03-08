"use client";
/**
 * Unit Converter
 * Categories: Length, Weight, Temperature, Speed, Area, Volume, Data.
 * Two dropdowns + number input. Swap button. All inline conversion logic.
 */
import { useState, useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ── Types ────────────────────────────────────────────────────────────────────
type Category = "Length" | "Weight" | "Temperature" | "Speed" | "Area" | "Volume" | "Data";

interface UnitDef {
  label: string;
  /** Convert this unit → base unit */
  toBase: (v: number) => number;
  /** Convert base unit → this unit */
  fromBase: (v: number) => number;
}

// ── Conversion tables ────────────────────────────────────────────────────────
// Base units: m, kg, °C (identity), m/s, m², L, bytes
const UNITS: Record<Category, Record<string, UnitDef>> = {
  Length: {
    mm:  { label: "Millimeter (mm)",  toBase: (v) => v / 1000,       fromBase: (v) => v * 1000 },
    cm:  { label: "Centimeter (cm)",  toBase: (v) => v / 100,        fromBase: (v) => v * 100 },
    m:   { label: "Meter (m)",        toBase: (v) => v,              fromBase: (v) => v },
    km:  { label: "Kilometer (km)",   toBase: (v) => v * 1000,       fromBase: (v) => v / 1000 },
    in:  { label: "Inch (in)",        toBase: (v) => v * 0.0254,     fromBase: (v) => v / 0.0254 },
    ft:  { label: "Foot (ft)",        toBase: (v) => v * 0.3048,     fromBase: (v) => v / 0.3048 },
    yd:  { label: "Yard (yd)",        toBase: (v) => v * 0.9144,     fromBase: (v) => v / 0.9144 },
    mi:  { label: "Mile (mi)",        toBase: (v) => v * 1609.344,   fromBase: (v) => v / 1609.344 },
    nmi: { label: "Nautical Mile",    toBase: (v) => v * 1852,       fromBase: (v) => v / 1852 },
  },
  Weight: {
    mg:  { label: "Milligram (mg)",   toBase: (v) => v / 1e6,        fromBase: (v) => v * 1e6 },
    g:   { label: "Gram (g)",         toBase: (v) => v / 1000,       fromBase: (v) => v * 1000 },
    kg:  { label: "Kilogram (kg)",    toBase: (v) => v,              fromBase: (v) => v },
    t:   { label: "Metric Ton (t)",   toBase: (v) => v * 1000,       fromBase: (v) => v / 1000 },
    oz:  { label: "Ounce (oz)",       toBase: (v) => v * 0.0283495,  fromBase: (v) => v / 0.0283495 },
    lb:  { label: "Pound (lb)",       toBase: (v) => v * 0.453592,   fromBase: (v) => v / 0.453592 },
    st:  { label: "Stone (st)",       toBase: (v) => v * 6.35029,    fromBase: (v) => v / 6.35029 },
  },
  Temperature: {
    C:  { label: "Celsius (°C)",      toBase: (v) => v,              fromBase: (v) => v },
    F:  { label: "Fahrenheit (°F)",   toBase: (v) => (v - 32) * 5/9, fromBase: (v) => v * 9/5 + 32 },
    K:  { label: "Kelvin (K)",        toBase: (v) => v - 273.15,     fromBase: (v) => v + 273.15 },
    R:  { label: "Rankine (°R)",      toBase: (v) => (v - 491.67) * 5/9, fromBase: (v) => v * 9/5 + 491.67 },
  },
  Speed: {
    "m/s":  { label: "Meter/sec (m/s)",    toBase: (v) => v,         fromBase: (v) => v },
    "km/h": { label: "Km/hour (km/h)",     toBase: (v) => v / 3.6,   fromBase: (v) => v * 3.6 },
    mph:    { label: "Miles/hour (mph)",   toBase: (v) => v * 0.44704, fromBase: (v) => v / 0.44704 },
    kn:     { label: "Knot (kn)",          toBase: (v) => v * 0.514444, fromBase: (v) => v / 0.514444 },
    "ft/s": { label: "Feet/sec (ft/s)",    toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
    mach:   { label: "Mach",               toBase: (v) => v * 343,    fromBase: (v) => v / 343 },
  },
  Area: {
    "mm²": { label: "mm²",            toBase: (v) => v / 1e6,        fromBase: (v) => v * 1e6 },
    "cm²": { label: "cm²",            toBase: (v) => v / 1e4,        fromBase: (v) => v * 1e4 },
    "m²":  { label: "m²",             toBase: (v) => v,              fromBase: (v) => v },
    "km²": { label: "km²",            toBase: (v) => v * 1e6,        fromBase: (v) => v / 1e6 },
    "in²": { label: "in²",            toBase: (v) => v * 6.4516e-4,  fromBase: (v) => v / 6.4516e-4 },
    "ft²": { label: "ft²",            toBase: (v) => v * 0.092903,   fromBase: (v) => v / 0.092903 },
    "yd²": { label: "yd²",            toBase: (v) => v * 0.836127,   fromBase: (v) => v / 0.836127 },
    ac:    { label: "Acre (ac)",       toBase: (v) => v * 4046.86,    fromBase: (v) => v / 4046.86 },
    ha:    { label: "Hectare (ha)",    toBase: (v) => v * 10000,      fromBase: (v) => v / 10000 },
  },
  Volume: {
    mL:    { label: "Milliliter (mL)",  toBase: (v) => v,             fromBase: (v) => v },
    L:     { label: "Liter (L)",        toBase: (v) => v * 1000,      fromBase: (v) => v / 1000 },
    "m³":  { label: "Cubic meter (m³)", toBase: (v) => v * 1e6,       fromBase: (v) => v / 1e6 },
    tsp:   { label: "Teaspoon (tsp)",   toBase: (v) => v * 4.92892,   fromBase: (v) => v / 4.92892 },
    tbsp:  { label: "Tablespoon (tbsp)",toBase: (v) => v * 14.7868,   fromBase: (v) => v / 14.7868 },
    "fl oz":{ label: "Fl. oz (fl oz)", toBase: (v) => v * 29.5735,   fromBase: (v) => v / 29.5735 },
    cup:   { label: "Cup",              toBase: (v) => v * 236.588,   fromBase: (v) => v / 236.588 },
    pt:    { label: "Pint (pt)",        toBase: (v) => v * 473.176,   fromBase: (v) => v / 473.176 },
    qt:    { label: "Quart (qt)",       toBase: (v) => v * 946.353,   fromBase: (v) => v / 946.353 },
    gal:   { label: "Gallon (gal)",     toBase: (v) => v * 3785.41,   fromBase: (v) => v / 3785.41 },
  },
  Data: {
    b:   { label: "Bit (b)",          toBase: (v) => v / 8,          fromBase: (v) => v * 8 },
    B:   { label: "Byte (B)",         toBase: (v) => v,              fromBase: (v) => v },
    KB:  { label: "Kilobyte (KB)",    toBase: (v) => v * 1024,       fromBase: (v) => v / 1024 },
    MB:  { label: "Megabyte (MB)",    toBase: (v) => v * 1024**2,    fromBase: (v) => v / 1024**2 },
    GB:  { label: "Gigabyte (GB)",    toBase: (v) => v * 1024**3,    fromBase: (v) => v / 1024**3 },
    TB:  { label: "Terabyte (TB)",    toBase: (v) => v * 1024**4,    fromBase: (v) => v / 1024**4 },
    PB:  { label: "Petabyte (PB)",    toBase: (v) => v * 1024**5,    fromBase: (v) => v / 1024**5 },
    Kib: { label: "Kibibyte (KiB)",   toBase: (v) => v * 1000,       fromBase: (v) => v / 1000 },
    Mib: { label: "Mebibyte (MiB)",   toBase: (v) => v * 1e6,        fromBase: (v) => v / 1e6 },
    Gib: { label: "Gibibyte (GiB)",   toBase: (v) => v * 1e9,        fromBase: (v) => v / 1e9 },
  },
};

const CATEGORIES = Object.keys(UNITS) as Category[];

function defaultUnits(cat: Category): [string, string] {
  const keys = Object.keys(UNITS[cat]);
  return [keys[0], keys[1] ?? keys[0]];
}

function convert(value: number, fromKey: string, toKey: string, cat: Category): number {
  const catUnits = UNITS[cat];
  const base = catUnits[fromKey].toBase(value);
  return catUnits[toKey].fromBase(base);
}

function formatResult(n: number): string {
  if (!isFinite(n)) return "—";
  if (Math.abs(n) >= 1e12 || (Math.abs(n) < 1e-6 && n !== 0)) {
    return n.toExponential(6);
  }
  const decimals = Math.abs(n) < 1 ? 8 : Math.abs(n) < 1000 ? 6 : 4;
  const str = n.toPrecision(10);
  const trimmed = parseFloat(str).toLocaleString("en-US", {
    maximumSignificantDigits: 10,
    maximumFractionDigits: decimals,
  });
  return trimmed;
}

// ── Component ────────────────────────────────────────────────────────────────
export default function UnitConverter() {
  const [category, setCategory] = useState<Category>("Length");
  const [fromUnit, setFromUnit] = useState<string>("m");
  const [toUnit, setToUnit] = useState<string>("ft");
  const [inputStr, setInputStr] = useState("1");

  const handleCategoryChange = useCallback((cat: Category) => {
    setCategory(cat);
    const [f, t] = defaultUnits(cat);
    setFromUnit(f);
    setToUnit(t);
    setInputStr("1");
  }, []);

  const handleSwap = useCallback(() => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  }, [fromUnit, toUnit]);

  const result = useMemo(() => {
    const v = parseFloat(inputStr);
    if (isNaN(v)) return null;
    return convert(v, fromUnit, toUnit, category);
  }, [inputStr, fromUnit, toUnit, category]);

  const catUnits = UNITS[category];
  const unitKeys = Object.keys(catUnits);

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Unit Converter</h1>
        <p className="text-sm text-muted-foreground">
          Convert between units of length, weight, temperature, speed, area, volume, and data.
        </p>
      </div>

      {/* Category selector */}
      <div className="space-y-1.5">
        <Label>Category</Label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                category === cat
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:bg-muted"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* From / To with swap */}
      <div className="flex items-end gap-2">
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="from-unit">From</Label>
          <Select value={fromUnit} onValueChange={setFromUnit}>
            <SelectTrigger id="from-unit">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {unitKeys.map((key) => (
                <SelectItem key={key} value={key}>
                  {catUnits[key].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={handleSwap}
          className="mb-0.5 shrink-0"
          aria-label="Swap units"
        >
          ⇄
        </Button>

        <div className="flex-1 space-y-1.5">
          <Label htmlFor="to-unit">To</Label>
          <Select value={toUnit} onValueChange={setToUnit}>
            <SelectTrigger id="to-unit">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {unitKeys.map((key) => (
                <SelectItem key={key} value={key}>
                  {catUnits[key].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Input */}
      <div className="space-y-1.5">
        <Label htmlFor="unit-input">Value</Label>
        <Input
          id="unit-input"
          type="number"
          placeholder="Enter value"
          value={inputStr}
          onChange={(e) => setInputStr(e.target.value)}
          className="text-lg"
        />
      </div>

      {/* Result */}
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        {result !== null ? (
          <>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Result
            </p>
            <p className="mt-2 text-4xl font-extrabold tracking-tight text-primary break-all">
              {formatResult(result)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {catUnits[toUnit]?.label ?? toUnit}
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              {inputStr} {catUnits[fromUnit]?.label ?? fromUnit} = {formatResult(result)}{" "}
              {catUnits[toUnit]?.label ?? toUnit}
            </p>
          </>
        ) : (
          <p className="text-muted-foreground text-sm">Enter a value to convert</p>
        )}
      </div>

      <p className="border-t border-border pt-4 text-xs text-muted-foreground">
        All conversions are performed inline without external libraries. Temperature conversions are exact.
      </p>
    </div>
  );
}
