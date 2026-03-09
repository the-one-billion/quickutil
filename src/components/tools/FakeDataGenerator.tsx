"use client";
/**
 * Fake Data Generator
 * Generates realistic-looking test data from hardcoded arrays.
 * No external libraries. All data is clearly labelled as synthetic.
 */
import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

// ── Data pools ─────────────────────────────────────────────────────────────

const FIRST_NAMES = [
  "James","Mary","John","Patricia","Robert","Jennifer","Michael","Linda",
  "William","Barbara","David","Elizabeth","Richard","Susan","Joseph","Jessica",
  "Thomas","Sarah","Charles","Karen","Christopher","Lisa","Daniel","Nancy",
  "Matthew","Betty","Anthony","Margaret","Mark","Sandra","Donald","Ashley",
  "Steven","Dorothy","Paul","Kimberly","Andrew","Emily","Kenneth","Donna",
  "Joshua","Michelle","Kevin","Carol","Brian","Amanda","George","Melissa",
  "Timothy","Deborah","Ronald","Stephanie","Edward","Rebecca","Jason","Laura",
  "Jeffrey","Sharon","Ryan","Cynthia","Jacob","Kathleen","Gary","Helen",
];

const LAST_NAMES = [
  "Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis",
  "Rodriguez","Martinez","Hernandez","Lopez","Gonzalez","Wilson","Anderson",
  "Thomas","Taylor","Moore","Jackson","Martin","Lee","Perez","Thompson",
  "White","Harris","Sanchez","Clark","Ramirez","Lewis","Robinson","Walker",
  "Young","Allen","King","Wright","Scott","Torres","Nguyen","Hill","Flores",
  "Green","Adams","Nelson","Baker","Hall","Rivera","Campbell","Mitchell",
  "Carter","Roberts","Phillips","Evans","Turner","Torres","Parker","Collins",
  "Edwards","Stewart","Flores","Morris","Nguyen","Murphy","Rivera","Cook",
];

const CITIES = [
  "New York","Los Angeles","Chicago","Houston","Phoenix","Philadelphia",
  "San Antonio","San Diego","Dallas","San Jose","Austin","Jacksonville",
  "San Francisco","Columbus","Charlotte","Indianapolis","Seattle","Denver",
  "Boston","Nashville","Portland","Las Vegas","Memphis","Louisville",
  "Baltimore","Milwaukee","Albuquerque","Tucson","Fresno","Sacramento",
  "London","Toronto","Sydney","Melbourne","Berlin","Paris","Tokyo","Seoul",
];

const COUNTRIES = [
  "United States","Canada","United Kingdom","Australia","Germany","France",
  "Japan","South Korea","Brazil","Mexico","India","China","Italy","Spain",
  "Netherlands","Sweden","Norway","Denmark","Finland","Switzerland",
  "Argentina","New Zealand","South Africa","Singapore","Ireland",
];

const STREETS = [
  "Main St","Oak Ave","Maple Dr","Cedar Ln","Elm St","Pine Rd","Sunset Blvd",
  "River Rd","Lake View Dr","Forest Ave","Hill Rd","Valley Way","Park Blvd",
  "Washington St","Lincoln Ave","Madison Dr","Jefferson Blvd","Monroe Way",
];

const COMPANIES = [
  "Apex Solutions","BlueWave Technologies","Cornerstone Group","Delta Systems",
  "Emerald Ventures","FusionCore Labs","Granite Partners","Horizon Digital",
  "Ironclad Consulting","Jetstream Media","Keystone Analytics","Luminary Tech",
  "Momentum Corp","Nexus Innovations","Onyx Dynamics","Pinnacle Group",
  "Quantum Networks","Redwood Enterprises","Synapse AI","Titanium Works",
  "Uplift Agency","Velocity Partners","Wavefront Studio","Xenon Technologies",
];

const JOB_TITLES = [
  "Software Engineer","Product Manager","Data Scientist","UX Designer",
  "DevOps Engineer","Marketing Manager","Sales Director","HR Specialist",
  "Financial Analyst","Operations Manager","Business Analyst","QA Engineer",
  "Cloud Architect","Content Strategist","Legal Counsel","Project Manager",
  "Account Executive","Research Scientist","Security Analyst","Full-Stack Developer",
];

const DOMAINS = ["gmail.com","yahoo.com","hotmail.com","outlook.com","icloud.com",
  "protonmail.com","fastmail.com","zoho.com","aol.com","example.com"];

const TLDS = ["com","net","org","io","co","dev","app","ai"];

// ── Field definitions ──────────────────────────────────────────────────────

const ALL_FIELDS = [
  "Full Name","First Name","Last Name",
  "Email","Phone","Username",
  "Street Address","City","Country","Zip Code",
  "Company Name","Job Title",
  "Date of Birth","Age",
  "UUID","IP Address","URL",
  "Credit Card (TEST ONLY)",
  "Color (Hex)","Boolean","Number",
] as const;

type FieldName = typeof ALL_FIELDS[number];

// ── RNG helpers ────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

function generateIP(): string {
  return `${randInt(1, 254)}.${randInt(0, 255)}.${randInt(0, 255)}.${randInt(1, 254)}`;
}

function generatePhone(): string {
  return `+1 (${randInt(200, 999)}) ${randInt(200, 999)}-${randInt(1000, 9999)}`;
}

function generateCreditCard(): string {
  // Luhn-valid fake Visa (starts with 4) — clearly test data
  const base = `4${Array.from({ length: 14 }, () => randInt(0, 9)).join("")}`;
  // Compute Luhn check digit
  let sum = 0;
  for (let i = 0; i < base.length; i++) {
    let d = parseInt(base[base.length - 1 - i]);
    if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
  }
  const check = (10 - (sum % 10)) % 10;
  const full = base + check;
  return `${full.slice(0, 4)} ${full.slice(4, 8)} ${full.slice(8, 12)} ${full.slice(12)}`;
}

function generateUrl(): string {
  const sub = pick(["www","app","api","shop","blog","portal","hub","dash"]);
  const company = pick(COMPANIES).toLowerCase().replace(/\s+/g, "").replace(/[^a-z]/g, "");
  return `https://${sub}.${company}.${pick(TLDS)}`;
}

function generateUsername(first: string, last: string): string {
  const styles = [
    () => `${first.toLowerCase()}${last.toLowerCase()}`,
    () => `${first.toLowerCase()}.${last.toLowerCase()}`,
    () => `${first.toLowerCase()}${randInt(10, 999)}`,
    () => `${first.slice(0, 1).toLowerCase()}${last.toLowerCase()}${randInt(1, 99)}`,
  ];
  return pick(styles)();
}

function generateDOB(): string {
  const y = randInt(1950, 2005);
  const m = randInt(1, 12);
  const d = randInt(1, 28);
  return `${y}-${pad2(m)}-${pad2(d)}`;
}

function generateZip(): string {
  return randInt(10000, 99999).toString();
}

function generateHex(): string {
  return `#${randInt(0, 0xFFFFFF).toString(16).padStart(6, "0").toUpperCase()}`;
}

// ── Row generator ──────────────────────────────────────────────────────────

function generateRow(
  fields: FieldName[],
  numberMin: number,
  numberMax: number,
): Record<string, string> {
  const first = pick(FIRST_NAMES);
  const last = pick(LAST_NAMES);
  const row: Record<string, string> = {};

  for (const field of fields) {
    switch (field) {
      case "Full Name":       row[field] = `${first} ${last}`; break;
      case "First Name":      row[field] = first; break;
      case "Last Name":       row[field] = last; break;
      case "Email":           row[field] = `${first.toLowerCase()}.${last.toLowerCase()}${randInt(1,99)}@${pick(DOMAINS)}`; break;
      case "Phone":           row[field] = generatePhone(); break;
      case "Username":        row[field] = generateUsername(first, last); break;
      case "Street Address":  row[field] = `${randInt(1, 9999)} ${pick(STREETS)}`; break;
      case "City":            row[field] = pick(CITIES); break;
      case "Country":         row[field] = pick(COUNTRIES); break;
      case "Zip Code":        row[field] = generateZip(); break;
      case "Company Name":    row[field] = pick(COMPANIES); break;
      case "Job Title":       row[field] = pick(JOB_TITLES); break;
      case "Date of Birth":   row[field] = generateDOB(); break;
      case "Age":             row[field] = randInt(18, 75).toString(); break;
      case "UUID":            row[field] = generateUUID(); break;
      case "IP Address":      row[field] = generateIP(); break;
      case "URL":             row[field] = generateUrl(); break;
      case "Credit Card (TEST ONLY)": row[field] = generateCreditCard(); break;
      case "Color (Hex)":     row[field] = generateHex(); break;
      case "Boolean":         row[field] = Math.random() > 0.5 ? "true" : "false"; break;
      case "Number":          row[field] = randInt(numberMin, numberMax).toString(); break;
      default:                row[field] = ""; break;
    }
  }
  return row;
}

// ── CSV / JSON helpers ─────────────────────────────────────────────────────

function toCSV(headers: string[], data: Record<string, string>[]): string {
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const header = headers.map(escape).join(",");
  const rows = data.map((row) => headers.map((h) => escape(row[h] ?? "")).join(","));
  return [header, ...rows].join("\n");
}

function downloadText(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Component ──────────────────────────────────────────────────────────────

const DEFAULT_FIELDS: FieldName[] = [
  "Full Name","Email","Phone","City","Country","Company Name","Job Title","UUID",
];

export default function FakeDataGenerator() {
  const [selectedFields, setSelectedFields] = useState<Set<FieldName>>(
    new Set(DEFAULT_FIELDS),
  );
  const [rowCount, setRowCount] = useState(10);
  const [numberMin, setNumberMin] = useState(1);
  const [numberMax, setNumberMax] = useState(1000);
  const [data, setData] = useState<Record<string, string>[]>([]);
  const [generated, setGenerated] = useState(false);

  const activeFields = useMemo(
    () => ALL_FIELDS.filter((f) => selectedFields.has(f)),
    [selectedFields],
  );

  const handleToggle = useCallback((field: FieldName) => {
    setSelectedFields((prev) => {
      const next = new Set(prev);
      next.has(field) ? next.delete(field) : next.add(field);
      return next;
    });
  }, []);

  const handleGenerate = useCallback(() => {
    const rows = Array.from({ length: rowCount }, () =>
      generateRow(activeFields, numberMin, numberMax),
    );
    setData(rows);
    setGenerated(true);
  }, [activeFields, rowCount, numberMin, numberMax]);

  const jsonText = useMemo(() => JSON.stringify(data, null, 2), [data]);
  const csvText  = useMemo(() => toCSV(activeFields, data), [activeFields, data]);

  const handleDownloadCSV  = () => downloadText(csvText, "fake-data.csv", "text/csv");
  const handleDownloadJSON = () => downloadText(jsonText, "fake-data.json", "application/json");

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Fake Data Generator</h1>
        <p className="text-sm text-muted-foreground">
          Select fields, set a row count, then generate synthetic test data.
          <span className="text-amber-600 dark:text-amber-400 font-medium"> All data is fictional.</span>
        </p>
      </div>

      {/* Field selector */}
      <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
        <Label className="text-sm font-semibold text-foreground">Fields to include</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
          {ALL_FIELDS.map((field) => (
            <div key={field} className="flex items-center justify-between gap-2">
              <Label
                htmlFor={`field-${field}`}
                className={`text-sm cursor-pointer select-none ${
                  field === "Credit Card (TEST ONLY)"
                    ? "text-amber-600 dark:text-amber-400 font-medium"
                    : "text-foreground"
                }`}
              >
                {field}
              </Label>
              <Switch
                id={`field-${field}`}
                checked={selectedFields.has(field)}
                onCheckedChange={() => handleToggle(field)}
                aria-label={`Toggle ${field}`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Number range (only shown if Number is selected) */}
      {selectedFields.has("Number") && (
        <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
          <Label className="text-sm font-semibold text-foreground">Number range</Label>
          <div className="flex items-center gap-3">
            <div className="flex flex-col gap-1 flex-1">
              <Label className="text-xs text-muted-foreground">Min</Label>
              <Input
                type="number"
                value={numberMin}
                onChange={(e) => setNumberMin(Number(e.target.value))}
                className="h-9 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <Label className="text-xs text-muted-foreground">Max</Label>
              <Input
                type="number"
                value={numberMax}
                onChange={(e) => setNumberMax(Number(e.target.value))}
                className="h-9 text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Row count */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-foreground">
          Rows: <span className="text-indigo-600 dark:text-indigo-400">{rowCount}</span>
        </Label>
        <Slider
          min={1}
          max={100}
          step={1}
          value={[rowCount]}
          onValueChange={([v]) => setRowCount(v)}
          className="w-full"
          aria-label="Row count"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1</span><span>100</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={handleGenerate}
          disabled={activeFields.length === 0}
          className="flex-1 sm:flex-none"
        >
          {generated ? "Regenerate" : "Generate"}
        </Button>
        {generated && (
          <>
            <Button variant="outline" onClick={handleDownloadCSV}>
              Download CSV
            </Button>
            <Button variant="outline" onClick={handleDownloadJSON}>
              Download JSON
            </Button>
          </>
        )}
      </div>

      {/* Output tabs */}
      {generated && data.length > 0 && (
        <Tabs defaultValue="table">
          <TabsList className="w-full">
            <TabsTrigger value="table" className="flex-1">Table</TabsTrigger>
            <TabsTrigger value="json"  className="flex-1">JSON</TabsTrigger>
            <TabsTrigger value="csv"   className="flex-1">CSV</TabsTrigger>
          </TabsList>

          {/* Table view */}
          <TabsContent value="table" className="pt-3">
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-3 py-2 text-left font-semibold text-muted-foreground w-8">#</th>
                    {activeFields.map((f) => (
                      <th key={f} className="px-3 py-2 text-left font-semibold text-muted-foreground whitespace-nowrap">
                        {f}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, idx) => (
                    <tr
                      key={idx}
                      className={`border-b border-border last:border-0 transition-colors ${
                        idx % 2 === 0 ? "bg-background" : "bg-muted/10"
                      } hover:bg-muted/30`}
                    >
                      <td className="px-3 py-2 text-muted-foreground tabular-nums">{idx + 1}</td>
                      {activeFields.map((f) => (
                        <td
                          key={f}
                          className={`px-3 py-2 text-foreground whitespace-nowrap ${
                            f === "Credit Card (TEST ONLY)" ? "text-amber-600 dark:text-amber-400 font-mono" : ""
                          } ${f === "Color (Hex)" ? "font-mono" : ""}`}
                        >
                          {f === "Color (Hex)" ? (
                            <span className="flex items-center gap-2">
                              <span
                                className="inline-block w-4 h-4 rounded-sm border border-border flex-shrink-0"
                                style={{ backgroundColor: row[f] }}
                              />
                              {row[f]}
                            </span>
                          ) : (
                            row[f]
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* JSON view */}
          <TabsContent value="json" className="pt-3">
            <pre className="max-h-[420px] overflow-auto rounded-xl border border-border bg-muted/30 px-4 py-3 text-xs font-mono text-foreground whitespace-pre">
              {jsonText}
            </pre>
          </TabsContent>

          {/* CSV view */}
          <TabsContent value="csv" className="pt-3">
            <pre className="max-h-[420px] overflow-auto rounded-xl border border-border bg-muted/30 px-4 py-3 text-xs font-mono text-foreground whitespace-pre">
              {csvText}
            </pre>
          </TabsContent>
        </Tabs>
      )}

      {generated && data.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">
          Select at least one field and click Generate.
        </p>
      )}
    </div>
  );
}
