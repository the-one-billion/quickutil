"use client";
/**
 * Email Validator
 * Validates single or bulk email addresses with detailed error reasons.
 * No external libraries — pure TypeScript regex + TLD list.
 */
import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ── Common TLD list ────────────────────────────────────────────────────────

const VALID_TLDS = new Set([
  "com","net","org","edu","gov","mil","int","co","io","ai","app","dev",
  "info","biz","name","mobi","pro","tel","travel","museum","jobs","aero",
  "coop","us","uk","ca","au","de","fr","jp","cn","br","in","ru","it","es",
  "nl","pl","se","no","fi","dk","be","at","ch","cz","pt","gr","hu","ro",
  "bg","hr","sk","si","ee","lv","lt","lu","ie","mt","cy","me","rs","mk",
  "al","ba","by","ua","md","ge","am","az","kz","uz","tm","kg","tj","mn",
  "nz","za","mx","ar","cl","pe","co","ve","ec","bo","py","uy","gt","cr",
  "do","cu","pr","tt","jm","bb","bs","ht","sg","my","ph","id","th","vn",
  "hk","tw","kr","pk","bd","lk","np","af","ir","iq","sa","ae","il","tr",
  "eg","ma","dz","tn","ly","gh","ng","ke","tz","ug","et","cm","sn","ci",
  "online","site","web","tech","media","store","shop","blog","news","live",
  "email","cloud","digital","link","space","plus","top","club","xyz","cc",
  "tv","fm","pm","re","gg","je","im","gl","fo","ax","is","li","mc","sm",
  "va","ad","gi","sg","to","nu","tk","ws","as","ck","ki","fm","mh","pw",
]);

// ── Validation logic ───────────────────────────────────────────────────────

interface ValidationResult {
  valid: boolean;
  reason: string;
}

function validateEmail(raw: string): ValidationResult {
  const email = raw.trim();

  if (!email) return { valid: false, reason: "Empty input" };
  if (/\s/.test(email)) return { valid: false, reason: "Contains spaces" };
  if (!email.includes("@")) return { valid: false, reason: 'Missing "@" symbol' };

  const atIndex = email.lastIndexOf("@");
  const local = email.slice(0, atIndex);
  const domain = email.slice(atIndex + 1);

  if (!local) return { valid: false, reason: "Missing local part (before @)" };
  if (local.length > 64) return { valid: false, reason: "Local part exceeds 64 characters" };
  if (!domain) return { valid: false, reason: "Missing domain (after @)" };
  if (!domain.includes(".")) return { valid: false, reason: "Domain missing dot" };
  if (domain.startsWith(".") || domain.endsWith("."))
    return { valid: false, reason: "Domain starts or ends with a dot" };
  if (domain.startsWith("-") || domain.endsWith("-"))
    return { valid: false, reason: "Domain starts or ends with a hyphen" };
  if (/@.*@/.test(email)) return { valid: false, reason: "Multiple @ symbols" };

  const domainParts = domain.split(".");
  const tld = domainParts[domainParts.length - 1].toLowerCase();

  if (tld.length < 2) return { valid: false, reason: "TLD too short (min 2 chars)" };
  if (!/^[a-zA-Z]+$/.test(tld)) return { valid: false, reason: "TLD contains non-alphabetic characters" };
  if (!VALID_TLDS.has(tld)) return { valid: false, reason: `Unknown TLD ".${tld}"` };

  // Full RFC-ish regex
  const fullRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
  if (!fullRegex.test(email)) return { valid: false, reason: "Invalid email format" };

  return { valid: true, reason: "Valid email address" };
}

// ── Types ──────────────────────────────────────────────────────────────────

interface BulkRow {
  email: string;
  valid: boolean;
  reason: string;
}

// ── Sub-components ─────────────────────────────────────────────────────────

function StatusBadge({ valid, reason }: { valid: boolean; reason: string }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
        valid
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400"
      }`}
    >
      <span className="text-base">{valid ? "✅" : "❌"}</span>
      <span>{reason}</span>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────

export default function EmailValidator() {
  // Single
  const [single, setSingle] = useState("");

  // Bulk
  const [bulk, setBulk] = useState("");
  const [copiedValid, setCopiedValid] = useState(false);

  // Single result
  const singleResult = useMemo<ValidationResult | null>(() => {
    if (!single.trim()) return null;
    return validateEmail(single);
  }, [single]);

  // Bulk results
  const bulkRows = useMemo<BulkRow[]>(() => {
    return bulk
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((email) => {
        const { valid, reason } = validateEmail(email);
        return { email, valid, reason };
      });
  }, [bulk]);

  const validCount = bulkRows.filter((r) => r.valid).length;
  const invalidCount = bulkRows.length - validCount;

  const handleCopyValid = useCallback(async () => {
    const valids = bulkRows.filter((r) => r.valid).map((r) => r.email).join("\n");
    await navigator.clipboard.writeText(valids);
    setCopiedValid(true);
    setTimeout(() => setCopiedValid(false), 2000);
  }, [bulkRows]);

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Email Validator</h1>
        <p className="text-sm text-muted-foreground">
          Validate a single address or paste a list for bulk checking.
        </p>
      </div>

      <Tabs defaultValue="single">
        <TabsList className="w-full">
          <TabsTrigger value="single" className="flex-1">Single</TabsTrigger>
          <TabsTrigger value="bulk" className="flex-1">Bulk</TabsTrigger>
        </TabsList>

        {/* ── Single tab ── */}
        <TabsContent value="single" className="space-y-4 pt-4">
          <Input
            type="email"
            placeholder="name@example.com"
            value={single}
            onChange={(e) => setSingle(e.target.value)}
            className="h-10 text-sm"
            aria-label="Email address to validate"
          />
          {singleResult && (
            <StatusBadge valid={singleResult.valid} reason={singleResult.reason} />
          )}
          {!singleResult && (
            <p className="text-sm text-muted-foreground">Type an email address to validate it.</p>
          )}
        </TabsContent>

        {/* ── Bulk tab ── */}
        <TabsContent value="bulk" className="space-y-4 pt-4">
          <textarea
            className="w-full min-h-[140px] resize-y rounded-xl border border-border bg-background px-4 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            placeholder={"user@example.com\nhello@domain.org\nbad-email@\n…"}
            value={bulk}
            onChange={(e) => setBulk(e.target.value)}
            aria-label="Emails to validate (one per line)"
          />

          {/* Stats */}
          {bulkRows.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Total", value: bulkRows.length, color: "" },
                { label: "Valid", value: validCount,  color: "text-emerald-600 dark:text-emerald-400" },
                { label: "Invalid", value: invalidCount, color: "text-rose-600 dark:text-rose-400" },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="flex flex-col items-center justify-center rounded-xl border border-border bg-muted/30 p-3 gap-0.5"
                >
                  <span className={`text-xl font-bold ${color || "text-foreground"}`}>{value}</span>
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Results table */}
          {bulkRows.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">Email</th>
                    <th className="px-4 py-2.5 text-center font-semibold text-muted-foreground w-20">Status</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {bulkRows.map((row, idx) => (
                    <tr
                      key={idx}
                      className={`border-b border-border last:border-0 ${
                        idx % 2 === 0 ? "bg-background" : "bg-muted/10"
                      } hover:bg-muted/30 transition-colors`}
                    >
                      <td className="px-4 py-2 font-mono text-xs text-foreground break-all max-w-[160px]">
                        {row.email}
                      </td>
                      <td className="px-4 py-2 text-center text-base">
                        {row.valid ? "✅" : "❌"}
                      </td>
                      <td className={`px-4 py-2 text-xs ${row.valid ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                        {row.reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Copy valid emails */}
          {bulkRows.length > 0 && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyValid}
                disabled={validCount === 0}
              >
                {copiedValid ? "Copied!" : `Copy ${validCount} Valid Email${validCount !== 1 ? "s" : ""}`}
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
