"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

const UPPERCASE = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const UPPERCASE_FULL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijkmnpqrstuvwxyz";
const LOWERCASE_FULL = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "23456789";
const NUMBERS_FULL = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";

type Strength = "Weak" | "Fair" | "Good" | "Strong";

function getStrength(password: string, charsetSize: number): Strength {
  const len = password.length;
  const entropy = len * Math.log2(charsetSize || 1);
  if (entropy < 40) return "Weak";
  if (entropy < 60) return "Fair";
  if (entropy < 80) return "Good";
  return "Strong";
}

const strengthConfig: Record<Strength, { color: string; width: string; textColor: string }> = {
  Weak: { color: "bg-red-500", width: "w-1/4", textColor: "text-red-500" },
  Fair: { color: "bg-orange-400", width: "w-2/4", textColor: "text-orange-400" },
  Good: { color: "bg-yellow-400", width: "w-3/4", textColor: "text-yellow-400" },
  Strong: { color: "bg-green-500", width: "w-full", textColor: "text-green-500" },
};

function generatePassword(
  length: number,
  uppercase: boolean,
  lowercase: boolean,
  numbers: boolean,
  symbols: boolean,
  excludeAmbiguous: boolean
): string {
  let charset = "";
  if (uppercase) charset += excludeAmbiguous ? UPPERCASE : UPPERCASE_FULL;
  if (lowercase) charset += excludeAmbiguous ? LOWERCASE : LOWERCASE_FULL;
  if (numbers) charset += excludeAmbiguous ? NUMBERS : NUMBERS_FULL;
  if (symbols) charset += SYMBOLS;

  if (!charset) return "";

  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (val) => charset[val % charset.length]).join("");
}

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const charsetSize =
    (uppercase ? (excludeAmbiguous ? UPPERCASE : UPPERCASE_FULL).length : 0) +
    (lowercase ? (excludeAmbiguous ? LOWERCASE : LOWERCASE_FULL).length : 0) +
    (numbers ? (excludeAmbiguous ? NUMBERS : NUMBERS_FULL).length : 0) +
    (symbols ? SYMBOLS.length : 0);

  const generate = useCallback(() => {
    setPassword(generatePassword(length, uppercase, lowercase, numbers, symbols, excludeAmbiguous));
  }, [length, uppercase, lowercase, numbers, symbols, excludeAmbiguous]);

  useEffect(() => {
    generate();
  }, [generate]);

  const strength = password ? getStrength(password, charsetSize) : "Weak";
  const { color, width, textColor } = strengthConfig[strength];

  async function copyPassword() {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const noneSelected = !uppercase && !lowercase && !numbers && !symbols;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Password Generator</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Generate strong, secure passwords using cryptographically random values.
        </p>
      </div>

      {/* Password display */}
      <div className="space-y-2">
        <Label className="text-foreground">Generated Password</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              readOnly
              type={showPassword ? "text" : "password"}
              value={password}
              className="font-mono text-base pr-10 bg-background border-border text-foreground"
              placeholder={noneSelected ? "Select at least one character type" : ""}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          <Button variant="outline" onClick={copyPassword} disabled={!password} className="shrink-0 border-border">
            {copied ? "Copied!" : "Copy"}
          </Button>
          <Button onClick={generate} disabled={noneSelected} className="shrink-0">
            Regenerate
          </Button>
        </div>

        {/* Strength bar */}
        {password && (
          <div className="space-y-1">
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-300 ${color} ${width}`} />
            </div>
            <p className={`text-xs font-medium ${textColor}`}>Strength: {strength}</p>
          </div>
        )}
      </div>

      {/* Length slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-foreground">Length</Label>
          <span className="text-sm font-mono font-medium text-foreground bg-muted px-2 py-0.5 rounded">
            {length}
          </span>
        </div>
        <Slider
          min={8}
          max={64}
          step={1}
          value={[length]}
          onValueChange={([val]) => setLength(val)}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>8</span>
          <span>64</span>
        </div>
      </div>

      {/* Character type toggles */}
      <div className="space-y-3">
        <Label className="text-foreground">Character Types</Label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            { id: "uppercase", label: "Uppercase (A–Z)", value: uppercase, setter: setUppercase },
            { id: "lowercase", label: "Lowercase (a–z)", value: lowercase, setter: setLowercase },
            { id: "numbers", label: "Numbers (0–9)", value: numbers, setter: setNumbers },
            { id: "symbols", label: "Symbols (!@#…)", value: symbols, setter: setSymbols },
          ].map(({ id, label, value, setter }) => (
            <div key={id} className="flex items-center gap-3 rounded-lg border border-border p-3">
              <Switch
                id={id}
                checked={value}
                onCheckedChange={setter}
              />
              <Label htmlFor={id} className="cursor-pointer text-sm text-foreground">
                {label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Exclude ambiguous */}
      <div className="flex items-center gap-3 rounded-lg border border-border p-3">
        <Switch
          id="exclude-ambiguous"
          checked={excludeAmbiguous}
          onCheckedChange={setExcludeAmbiguous}
        />
        <div>
          <Label htmlFor="exclude-ambiguous" className="cursor-pointer text-sm text-foreground">
            Exclude ambiguous characters
          </Label>
          <p className="text-xs text-muted-foreground">Removes 0, O, l, 1, I to avoid confusion</p>
        </div>
      </div>

      {noneSelected && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500">
          Select at least one character type to generate a password.
        </p>
      )}
    </div>
  );
}
