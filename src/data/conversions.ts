// ─── Types ────────────────────────────────────────────────────────────────────

export type ConversionCategory =
  | "weight"
  | "length"
  | "temperature"
  | "area"
  | "volume"
  | "speed"
  | "pressure"
  | "energy"
  | "power"
  | "digital"
  | "time"
  | "fuel";

export interface ConversionUnit {
  id: string;
  name: string;
  namePlural: string;
  symbol: string;
  toBase: (v: number) => number;
  fromBase: (v: number) => number;
}

export interface ConversionCategoryDef {
  id: ConversionCategory;
  name: string;
  baseUnitId: string;
  units: ConversionUnit[];
  icon: string;
}

export interface ConversionPair {
  slug: string;
  fromId: string;
  toId: string;
  fromName: string;
  toName: string;
  fromSymbol: string;
  toSymbol: string;
  category: ConversionCategory;
  categoryName: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  commonValues: number[];
  formula: string;
  inverseSlug: string;
}

// ─── Category common values ───────────────────────────────────────────────────

const COMMON_VALUES: Record<ConversionCategory, number[]> = {
  weight:      [1, 5, 10, 20, 50, 100, 500, 1000],
  length:      [1, 2, 5, 10, 25, 50, 100, 500, 1000],
  temperature: [0, 10, 20, 37, 50, 100, -10, -20, 200],
  area:        [1, 10, 100, 500, 1000, 5000],
  volume:      [1, 2, 5, 10, 20, 50, 100],
  speed:       [10, 30, 50, 60, 80, 100, 120, 200],
  pressure:    [1, 10, 100, 1000],
  energy:      [1, 10, 100, 1000],
  power:       [100, 500, 1000, 5000, 10000],
  digital:     [1, 10, 100, 500, 1000, 5000, 10000],
  time:        [1, 5, 10, 30, 60, 100, 1000],
  fuel:        [10, 15, 20, 25, 30, 35, 40, 50],
};

// ─── Categories ───────────────────────────────────────────────────────────────

export const conversionCategories: ConversionCategoryDef[] = [
  // ── Weight (base: grams) ──────────────────────────────────────────────────
  {
    id: "weight",
    name: "Weight",
    baseUnitId: "g",
    icon: "Weight",
    units: [
      {
        id: "g",
        name: "Gram",
        namePlural: "Grams",
        symbol: "g",
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      {
        id: "kg",
        name: "Kilogram",
        namePlural: "Kilograms",
        symbol: "kg",
        toBase: (v) => v * 1000,
        fromBase: (v) => v / 1000,
      },
      {
        id: "mg",
        name: "Milligram",
        namePlural: "Milligrams",
        symbol: "mg",
        toBase: (v) => v / 1000,
        fromBase: (v) => v * 1000,
      },
      {
        id: "lb",
        name: "Pound",
        namePlural: "Pounds",
        symbol: "lb",
        toBase: (v) => v * 453.592,
        fromBase: (v) => v / 453.592,
      },
      {
        id: "oz",
        name: "Ounce",
        namePlural: "Ounces",
        symbol: "oz",
        toBase: (v) => v * 28.3495,
        fromBase: (v) => v / 28.3495,
      },
      {
        id: "st",
        name: "Stone",
        namePlural: "Stone",
        symbol: "st",
        toBase: (v) => v * 6350.29,
        fromBase: (v) => v / 6350.29,
      },
      {
        id: "t",
        name: "Metric Ton",
        namePlural: "Metric Tons",
        symbol: "t",
        toBase: (v) => v * 1_000_000,
        fromBase: (v) => v / 1_000_000,
      },
      {
        id: "ton",
        name: "Short Ton",
        namePlural: "Short Tons",
        symbol: "ton",
        toBase: (v) => v * 907_185,
        fromBase: (v) => v / 907_185,
      },
    ],
  },

  // ── Length (base: meters) ─────────────────────────────────────────────────
  {
    id: "length",
    name: "Length",
    baseUnitId: "m",
    icon: "Ruler",
    units: [
      {
        id: "m",
        name: "Meter",
        namePlural: "Meters",
        symbol: "m",
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      {
        id: "cm",
        name: "Centimeter",
        namePlural: "Centimeters",
        symbol: "cm",
        toBase: (v) => v / 100,
        fromBase: (v) => v * 100,
      },
      {
        id: "mm",
        name: "Millimeter",
        namePlural: "Millimeters",
        symbol: "mm",
        toBase: (v) => v / 1000,
        fromBase: (v) => v * 1000,
      },
      {
        id: "km",
        name: "Kilometer",
        namePlural: "Kilometers",
        symbol: "km",
        toBase: (v) => v * 1000,
        fromBase: (v) => v / 1000,
      },
      {
        id: "in",
        name: "Inch",
        namePlural: "Inches",
        symbol: "in",
        toBase: (v) => v * 0.0254,
        fromBase: (v) => v / 0.0254,
      },
      {
        id: "ft",
        name: "Foot",
        namePlural: "Feet",
        symbol: "ft",
        toBase: (v) => v * 0.3048,
        fromBase: (v) => v / 0.3048,
      },
      {
        id: "yd",
        name: "Yard",
        namePlural: "Yards",
        symbol: "yd",
        toBase: (v) => v * 0.9144,
        fromBase: (v) => v / 0.9144,
      },
      {
        id: "mi",
        name: "Mile",
        namePlural: "Miles",
        symbol: "mi",
        toBase: (v) => v * 1609.344,
        fromBase: (v) => v / 1609.344,
      },
      {
        id: "nmi",
        name: "Nautical Mile",
        namePlural: "Nautical Miles",
        symbol: "nmi",
        toBase: (v) => v * 1852,
        fromBase: (v) => v / 1852,
      },
      {
        id: "ly",
        name: "Light Year",
        namePlural: "Light Years",
        symbol: "ly",
        toBase: (v) => v * 9.461e15,
        fromBase: (v) => v / 9.461e15,
      },
    ],
  },

  // ── Temperature (special — base: Celsius) ─────────────────────────────────
  {
    id: "temperature",
    name: "Temperature",
    baseUnitId: "c",
    icon: "Thermometer",
    units: [
      {
        id: "c",
        name: "Celsius",
        namePlural: "Celsius",
        symbol: "°C",
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      {
        id: "f",
        name: "Fahrenheit",
        namePlural: "Fahrenheit",
        symbol: "°F",
        toBase: (v) => ((v - 32) * 5) / 9,
        fromBase: (v) => (v * 9) / 5 + 32,
      },
      {
        id: "k",
        name: "Kelvin",
        namePlural: "Kelvin",
        symbol: "K",
        toBase: (v) => v - 273.15,
        fromBase: (v) => v + 273.15,
      },
    ],
  },

  // ── Area (base: square meters) ────────────────────────────────────────────
  {
    id: "area",
    name: "Area",
    baseUnitId: "m2",
    icon: "Square",
    units: [
      {
        id: "m2",
        name: "Square Meter",
        namePlural: "Square Meters",
        symbol: "m²",
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      {
        id: "cm2",
        name: "Square Centimeter",
        namePlural: "Square Centimeters",
        symbol: "cm²",
        toBase: (v) => v / 10_000,
        fromBase: (v) => v * 10_000,
      },
      {
        id: "ft2",
        name: "Square Foot",
        namePlural: "Square Feet",
        symbol: "ft²",
        toBase: (v) => v * 0.092903,
        fromBase: (v) => v / 0.092903,
      },
      {
        id: "in2",
        name: "Square Inch",
        namePlural: "Square Inches",
        symbol: "in²",
        toBase: (v) => v * 0.00064516,
        fromBase: (v) => v / 0.00064516,
      },
      {
        id: "km2",
        name: "Square Kilometer",
        namePlural: "Square Kilometers",
        symbol: "km²",
        toBase: (v) => v * 1_000_000,
        fromBase: (v) => v / 1_000_000,
      },
      {
        id: "mi2",
        name: "Square Mile",
        namePlural: "Square Miles",
        symbol: "mi²",
        toBase: (v) => v * 2_589_988,
        fromBase: (v) => v / 2_589_988,
      },
      {
        id: "ac",
        name: "Acre",
        namePlural: "Acres",
        symbol: "ac",
        toBase: (v) => v * 4046.86,
        fromBase: (v) => v / 4046.86,
      },
      {
        id: "ha",
        name: "Hectare",
        namePlural: "Hectares",
        symbol: "ha",
        toBase: (v) => v * 10_000,
        fromBase: (v) => v / 10_000,
      },
    ],
  },

  // ── Volume (base: liters) ─────────────────────────────────────────────────
  {
    id: "volume",
    name: "Volume",
    baseUnitId: "L",
    icon: "Cylinder",
    units: [
      {
        id: "L",
        name: "Liter",
        namePlural: "Liters",
        symbol: "L",
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      {
        id: "mL",
        name: "Milliliter",
        namePlural: "Milliliters",
        symbol: "mL",
        toBase: (v) => v / 1000,
        fromBase: (v) => v * 1000,
      },
      {
        id: "m3",
        name: "Cubic Meter",
        namePlural: "Cubic Meters",
        symbol: "m³",
        toBase: (v) => v * 1000,
        fromBase: (v) => v / 1000,
      },
      {
        id: "gal",
        name: "US Gallon",
        namePlural: "US Gallons",
        symbol: "gal",
        toBase: (v) => v * 3.78541,
        fromBase: (v) => v / 3.78541,
      },
      {
        id: "qt",
        name: "US Quart",
        namePlural: "US Quarts",
        symbol: "qt",
        toBase: (v) => v * 0.946353,
        fromBase: (v) => v / 0.946353,
      },
      {
        id: "pt",
        name: "US Pint",
        namePlural: "US Pints",
        symbol: "pt",
        toBase: (v) => v * 0.473176,
        fromBase: (v) => v / 0.473176,
      },
      {
        id: "cup",
        name: "US Cup",
        namePlural: "US Cups",
        symbol: "cup",
        toBase: (v) => v * 0.236588,
        fromBase: (v) => v / 0.236588,
      },
      {
        id: "floz",
        name: "US Fluid Ounce",
        namePlural: "US Fluid Ounces",
        symbol: "fl oz",
        toBase: (v) => v * 0.0295735,
        fromBase: (v) => v / 0.0295735,
      },
      {
        id: "tbsp",
        name: "Tablespoon",
        namePlural: "Tablespoons",
        symbol: "tbsp",
        toBase: (v) => v * 0.0147868,
        fromBase: (v) => v / 0.0147868,
      },
      {
        id: "tsp",
        name: "Teaspoon",
        namePlural: "Teaspoons",
        symbol: "tsp",
        toBase: (v) => v * 0.00492892,
        fromBase: (v) => v / 0.00492892,
      },
      {
        id: "in3",
        name: "Cubic Inch",
        namePlural: "Cubic Inches",
        symbol: "in³",
        toBase: (v) => v * 0.0163871,
        fromBase: (v) => v / 0.0163871,
      },
      {
        id: "ft3",
        name: "Cubic Foot",
        namePlural: "Cubic Feet",
        symbol: "ft³",
        toBase: (v) => v * 28.3168,
        fromBase: (v) => v / 28.3168,
      },
    ],
  },

  // ── Speed (base: m/s) ─────────────────────────────────────────────────────
  {
    id: "speed",
    name: "Speed",
    baseUnitId: "ms",
    icon: "Gauge",
    units: [
      {
        id: "ms",
        name: "Meter per Second",
        namePlural: "Meters per Second",
        symbol: "m/s",
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      {
        id: "kmh",
        name: "Kilometer per Hour",
        namePlural: "Kilometers per Hour",
        symbol: "km/h",
        toBase: (v) => v / 3.6,
        fromBase: (v) => v * 3.6,
      },
      {
        id: "mph",
        name: "Mile per Hour",
        namePlural: "Miles per Hour",
        symbol: "mph",
        toBase: (v) => v * 0.44704,
        fromBase: (v) => v / 0.44704,
      },
      {
        id: "kn",
        name: "Knot",
        namePlural: "Knots",
        symbol: "kn",
        toBase: (v) => v * 0.514444,
        fromBase: (v) => v / 0.514444,
      },
      {
        id: "fps",
        name: "Foot per Second",
        namePlural: "Feet per Second",
        symbol: "fps",
        toBase: (v) => v * 0.3048,
        fromBase: (v) => v / 0.3048,
      },
      {
        id: "mach",
        name: "Mach",
        namePlural: "Mach",
        symbol: "Mach",
        toBase: (v) => v * 340.29,
        fromBase: (v) => v / 340.29,
      },
    ],
  },

  // ── Pressure (base: pascals) ──────────────────────────────────────────────
  {
    id: "pressure",
    name: "Pressure",
    baseUnitId: "Pa",
    icon: "ArrowDownToLine",
    units: [
      {
        id: "Pa",
        name: "Pascal",
        namePlural: "Pascals",
        symbol: "Pa",
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      {
        id: "kPa",
        name: "Kilopascal",
        namePlural: "Kilopascals",
        symbol: "kPa",
        toBase: (v) => v * 1000,
        fromBase: (v) => v / 1000,
      },
      {
        id: "bar",
        name: "Bar",
        namePlural: "Bar",
        symbol: "bar",
        toBase: (v) => v * 100_000,
        fromBase: (v) => v / 100_000,
      },
      {
        id: "psi",
        name: "Pound per Square Inch",
        namePlural: "Pounds per Square Inch",
        symbol: "psi",
        toBase: (v) => v * 6894.76,
        fromBase: (v) => v / 6894.76,
      },
      {
        id: "atm",
        name: "Atmosphere",
        namePlural: "Atmospheres",
        symbol: "atm",
        toBase: (v) => v * 101_325,
        fromBase: (v) => v / 101_325,
      },
      {
        id: "mmHg",
        name: "Millimeter of Mercury",
        namePlural: "Millimeters of Mercury",
        symbol: "mmHg",
        toBase: (v) => v * 133.322,
        fromBase: (v) => v / 133.322,
      },
      {
        id: "torr",
        name: "Torr",
        namePlural: "Torr",
        symbol: "Torr",
        toBase: (v) => v * 133.322,
        fromBase: (v) => v / 133.322,
      },
    ],
  },

  // ── Energy (base: joules) ─────────────────────────────────────────────────
  {
    id: "energy",
    name: "Energy",
    baseUnitId: "J",
    icon: "Zap",
    units: [
      {
        id: "J",
        name: "Joule",
        namePlural: "Joules",
        symbol: "J",
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      {
        id: "kJ",
        name: "Kilojoule",
        namePlural: "Kilojoules",
        symbol: "kJ",
        toBase: (v) => v * 1000,
        fromBase: (v) => v / 1000,
      },
      {
        id: "cal",
        name: "Calorie",
        namePlural: "Calories",
        symbol: "cal",
        toBase: (v) => v * 4.184,
        fromBase: (v) => v / 4.184,
      },
      {
        id: "kcal",
        name: "Kilocalorie",
        namePlural: "Kilocalories",
        symbol: "kcal",
        toBase: (v) => v * 4184,
        fromBase: (v) => v / 4184,
      },
      {
        id: "Wh",
        name: "Watt-Hour",
        namePlural: "Watt-Hours",
        symbol: "Wh",
        toBase: (v) => v * 3600,
        fromBase: (v) => v / 3600,
      },
      {
        id: "kWh",
        name: "Kilowatt-Hour",
        namePlural: "Kilowatt-Hours",
        symbol: "kWh",
        toBase: (v) => v * 3_600_000,
        fromBase: (v) => v / 3_600_000,
      },
      {
        id: "BTU",
        name: "British Thermal Unit",
        namePlural: "British Thermal Units",
        symbol: "BTU",
        toBase: (v) => v * 1055.06,
        fromBase: (v) => v / 1055.06,
      },
      {
        id: "eV",
        name: "Electron Volt",
        namePlural: "Electron Volts",
        symbol: "eV",
        toBase: (v) => v * 1.602e-19,
        fromBase: (v) => v / 1.602e-19,
      },
      {
        id: "MJ",
        name: "Megajoule",
        namePlural: "Megajoules",
        symbol: "MJ",
        toBase: (v) => v * 1_000_000,
        fromBase: (v) => v / 1_000_000,
      },
    ],
  },

  // ── Power (base: watts) ───────────────────────────────────────────────────
  {
    id: "power",
    name: "Power",
    baseUnitId: "W",
    icon: "Lightbulb",
    units: [
      {
        id: "W",
        name: "Watt",
        namePlural: "Watts",
        symbol: "W",
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      {
        id: "kW",
        name: "Kilowatt",
        namePlural: "Kilowatts",
        symbol: "kW",
        toBase: (v) => v * 1000,
        fromBase: (v) => v / 1000,
      },
      {
        id: "MW",
        name: "Megawatt",
        namePlural: "Megawatts",
        symbol: "MW",
        toBase: (v) => v * 1_000_000,
        fromBase: (v) => v / 1_000_000,
      },
      {
        id: "hp",
        name: "Horsepower",
        namePlural: "Horsepower",
        symbol: "hp",
        toBase: (v) => v * 745.7,
        fromBase: (v) => v / 745.7,
      },
      {
        id: "BTUh",
        name: "BTU per Hour",
        namePlural: "BTU per Hour",
        symbol: "BTU/h",
        toBase: (v) => v * 0.293071,
        fromBase: (v) => v / 0.293071,
      },
    ],
  },

  // ── Digital Storage (base: bytes) ─────────────────────────────────────────
  {
    id: "digital",
    name: "Digital Storage",
    baseUnitId: "B",
    icon: "HardDrive",
    units: [
      {
        id: "B",
        name: "Byte",
        namePlural: "Bytes",
        symbol: "B",
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      {
        id: "KB",
        name: "Kilobyte",
        namePlural: "Kilobytes",
        symbol: "KB",
        toBase: (v) => v * 1024,
        fromBase: (v) => v / 1024,
      },
      {
        id: "MB",
        name: "Megabyte",
        namePlural: "Megabytes",
        symbol: "MB",
        toBase: (v) => v * 1_048_576,
        fromBase: (v) => v / 1_048_576,
      },
      {
        id: "GB",
        name: "Gigabyte",
        namePlural: "Gigabytes",
        symbol: "GB",
        toBase: (v) => v * 1_073_741_824,
        fromBase: (v) => v / 1_073_741_824,
      },
      {
        id: "TB",
        name: "Terabyte",
        namePlural: "Terabytes",
        symbol: "TB",
        toBase: (v) => v * 1_099_511_627_776,
        fromBase: (v) => v / 1_099_511_627_776,
      },
      {
        id: "PB",
        name: "Petabyte",
        namePlural: "Petabytes",
        symbol: "PB",
        toBase: (v) => v * 1.126e15,
        fromBase: (v) => v / 1.126e15,
      },
      {
        id: "KiB",
        name: "Kibibyte",
        namePlural: "Kibibytes",
        symbol: "KiB",
        toBase: (v) => v * 1024,
        fromBase: (v) => v / 1024,
      },
      {
        id: "MiB",
        name: "Mebibyte",
        namePlural: "Mebibytes",
        symbol: "MiB",
        toBase: (v) => v * 1_048_576,
        fromBase: (v) => v / 1_048_576,
      },
      {
        id: "GiB",
        name: "Gibibyte",
        namePlural: "Gibibytes",
        symbol: "GiB",
        toBase: (v) => v * 1_073_741_824,
        fromBase: (v) => v / 1_073_741_824,
      },
    ],
  },

  // ── Time (base: seconds) ──────────────────────────────────────────────────
  {
    id: "time",
    name: "Time",
    baseUnitId: "s",
    icon: "Clock",
    units: [
      {
        id: "ms",
        name: "Millisecond",
        namePlural: "Milliseconds",
        symbol: "ms",
        toBase: (v) => v / 1000,
        fromBase: (v) => v * 1000,
      },
      {
        id: "s",
        name: "Second",
        namePlural: "Seconds",
        symbol: "s",
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      {
        id: "min",
        name: "Minute",
        namePlural: "Minutes",
        symbol: "min",
        toBase: (v) => v * 60,
        fromBase: (v) => v / 60,
      },
      {
        id: "h",
        name: "Hour",
        namePlural: "Hours",
        symbol: "h",
        toBase: (v) => v * 3600,
        fromBase: (v) => v / 3600,
      },
      {
        id: "d",
        name: "Day",
        namePlural: "Days",
        symbol: "d",
        toBase: (v) => v * 86_400,
        fromBase: (v) => v / 86_400,
      },
      {
        id: "wk",
        name: "Week",
        namePlural: "Weeks",
        symbol: "wk",
        toBase: (v) => v * 604_800,
        fromBase: (v) => v / 604_800,
      },
      {
        id: "mo",
        name: "Month",
        namePlural: "Months",
        symbol: "mo",
        toBase: (v) => v * 2_629_800,
        fromBase: (v) => v / 2_629_800,
      },
      {
        id: "yr",
        name: "Year",
        namePlural: "Years",
        symbol: "yr",
        toBase: (v) => v * 31_557_600,
        fromBase: (v) => v / 31_557_600,
      },
    ],
  },

  // ── Fuel Economy (base: L/100km) ──────────────────────────────────────────
  {
    id: "fuel",
    name: "Fuel Economy",
    baseUnitId: "l100km",
    icon: "Fuel",
    units: [
      {
        id: "l100km",
        name: "Liter per 100 Kilometers",
        namePlural: "Liters per 100 Kilometers",
        symbol: "L/100km",
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      {
        id: "mpg",
        name: "Mile per Gallon",
        namePlural: "Miles per Gallon",
        symbol: "mpg",
        toBase: (v) => 235.215 / v,
        fromBase: (v) => 235.215 / v,
      },
      {
        id: "kml",
        name: "Kilometer per Liter",
        namePlural: "Kilometers per Liter",
        symbol: "km/L",
        toBase: (v) => 100 / v,
        fromBase: (v) => 100 / v,
      },
    ],
  },
];

// ─── Helper: format factor ────────────────────────────────────────────────────

function formatFactor(n: number): string {
  // Use toPrecision for very small/large numbers, else toFixed(6) strip trailing zeros
  if (n === 0) return "0";
  if (Math.abs(n) < 0.000001 || Math.abs(n) >= 1e12) {
    return n.toPrecision(6).replace(/\.?0+$/, "");
  }
  return parseFloat(n.toFixed(6)).toString();
}

// ─── Build formula string ─────────────────────────────────────────────────────

function buildFormula(
  from: ConversionUnit,
  to: ConversionUnit,
  category: ConversionCategory
): string {
  if (category === "temperature") {
    if (from.id === "c" && to.id === "f") return "°F = (°C × 9/5) + 32";
    if (from.id === "f" && to.id === "c") return "°C = (°F − 32) × 5/9";
    if (from.id === "c" && to.id === "k") return "K = °C + 273.15";
    if (from.id === "k" && to.id === "c") return "°C = K − 273.15";
    if (from.id === "f" && to.id === "k") return "K = (°F − 32) × 5/9 + 273.15";
    if (from.id === "k" && to.id === "f") return "°F = (K − 273.15) × 9/5 + 32";
    return `${to.symbol} = f(${from.symbol})`;
  }
  if (category === "fuel") {
    if (from.id === "mpg" && to.id === "l100km") return "L/100km = 235.215 ÷ mpg";
    if (from.id === "l100km" && to.id === "mpg") return "mpg = 235.215 ÷ L/100km";
    if (from.id === "kml" && to.id === "l100km") return "L/100km = 100 ÷ km/L";
    if (from.id === "l100km" && to.id === "kml") return "km/L = 100 ÷ L/100km";
    if (from.id === "mpg" && to.id === "kml") return "km/L = mpg × 0.425144";
    if (from.id === "kml" && to.id === "mpg") return "mpg = km/L × 2.35215";
    return `${to.symbol} = f(${from.symbol})`;
  }
  // Ratio-based: convert 1 from-unit through base to to-unit
  const factor = to.fromBase(from.toBase(1));
  return `${to.symbol} = ${from.symbol} × ${formatFactor(factor)}`;
}

// ─── Build slug ───────────────────────────────────────────────────────────────

function buildSlug(fromId: string, toId: string): string {
  // sanitize ids: replace special chars with dashes, lowercase
  const sanitize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  return `${sanitize(fromId)}-to-${sanitize(toId)}`;
}

// ─── Generate all conversion pairs ───────────────────────────────────────────

function generatePairs(): ConversionPair[] {
  const pairs: ConversionPair[] = [];

  for (const cat of conversionCategories) {
    const commonValues = COMMON_VALUES[cat.id];

    for (const from of cat.units) {
      for (const to of cat.units) {
        if (from.id === to.id) continue;

        const slug = buildSlug(from.id, to.id);
        const inverseSlug = buildSlug(to.id, from.id);
        const formula = buildFormula(from, to, cat.id);

        pairs.push({
          slug,
          fromId: from.id,
          toId: to.id,
          fromName: from.namePlural,
          toName: to.namePlural,
          fromSymbol: from.symbol,
          toSymbol: to.symbol,
          category: cat.id,
          categoryName: cat.name,
          metaTitle: `${from.namePlural} to ${to.namePlural} Converter (${from.symbol} to ${to.symbol})`,
          metaDescription: `Convert ${from.namePlural} to ${to.namePlural} instantly. Free online ${from.symbol} to ${to.symbol} calculator with formula, conversion table, and examples. No signup required.`,
          h1: `${from.namePlural} to ${to.namePlural} Converter`,
          commonValues,
          formula,
          inverseSlug,
        });
      }
    }
  }

  return pairs;
}

export const conversionPairs: ConversionPair[] = generatePairs();

// ─── Lookup helpers ───────────────────────────────────────────────────────────

export function getConversionBySlug(slug: string): ConversionPair | undefined {
  return conversionPairs.find((p) => p.slug === slug);
}

export function getRelatedConversions(
  pair: ConversionPair,
  limit: number
): ConversionPair[] {
  return conversionPairs
    .filter(
      (p) =>
        p.category === pair.category &&
        p.slug !== pair.slug &&
        p.slug !== pair.inverseSlug
    )
    .slice(0, limit);
}

// ─── Unit lookup helper (for client component) ────────────────────────────────

export function getCategoryForPair(
  pair: ConversionPair
): ConversionCategoryDef | undefined {
  return conversionCategories.find((c) => c.id === pair.category);
}
