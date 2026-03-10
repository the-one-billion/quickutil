"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Lock, Unlock, Copy, Check } from "lucide-react";

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const raw = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as unknown as ArrayBuffer, iterations: 100000, hash: "SHA-256" },
    raw,
    { name: "AES-GCM", length: 256 },
    false, ["encrypt", "decrypt"]
  );
}

function toHex(buf: ArrayBuffer | Uint8Array) { return Array.from(buf instanceof Uint8Array ? buf : new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,"0")).join(""); }
function fromHex(h: string) { const a = new Uint8Array(h.length/2); for(let i=0;i<h.length;i+=2) a[i/2]=parseInt(h.slice(i,i+2),16); return a; }

async function encryptText(text: string, password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv   = crypto.getRandomValues(new Uint8Array(12));
  const key  = await deriveKey(password, salt);
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(text));
  return `${toHex(salt)}:${toHex(iv)}:${toHex(encrypted)}`;
}

async function decryptText(ciphertext: string, password: string): Promise<string> {
  const [saltHex, ivHex, dataHex] = ciphertext.split(":");
  const salt = fromHex(saltHex), iv = fromHex(ivHex), data = fromHex(dataHex);
  const key  = await deriveKey(password, salt);
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
  return new TextDecoder().decode(decrypted);
}

export default function TextEncrypt() {
  const [mode, setMode]         = useState<"encrypt" | "decrypt">("encrypt");
  const [input, setInput]       = useState("");
  const [password, setPassword] = useState("");
  const [output, setOutput]     = useState("");
  const [error, setError]       = useState("");
  const [copied, setCopied]     = useState(false);

  const process = async () => {
    setError(""); setOutput("");
    if (!input.trim() || !password) return;
    try {
      if (mode === "encrypt") setOutput(await encryptText(input, password));
      else setOutput(await decryptText(input.trim(), password));
    } catch {
      setError(mode === "decrypt" ? "Decryption failed — wrong password or corrupted data." : "Encryption failed.");
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 max-w-lg">
      <div className="flex gap-2">
        <Button variant={mode === "encrypt" ? "default" : "outline"} size="sm" onClick={() => { setMode("encrypt"); setOutput(""); setError(""); }}>
          <Lock className="h-4 w-4 mr-1" />Encrypt
        </Button>
        <Button variant={mode === "decrypt" ? "default" : "outline"} size="sm" onClick={() => { setMode("decrypt"); setOutput(""); setError(""); }}>
          <Unlock className="h-4 w-4 mr-1" />Decrypt
        </Button>
      </div>
      <div>
        <Label className="mb-1 block">{mode === "encrypt" ? "Plaintext" : "Encrypted text"}</Label>
        <Textarea value={input} onChange={e => setInput(e.target.value)} rows={5}
          placeholder={mode === "encrypt" ? "Enter text to encrypt…" : "Paste encrypted text here…"} />
      </div>
      <div>
        <Label className="mb-1 block">Password</Label>
        <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter a strong password" />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button onClick={process} className="w-full">
        {mode === "encrypt" ? <><Lock className="h-4 w-4 mr-2" />Encrypt</> : <><Unlock className="h-4 w-4 mr-2" />Decrypt</>}
      </Button>
      {output && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <Label>{mode === "encrypt" ? "Encrypted output" : "Decrypted text"}</Label>
            <Button size="sm" variant="outline" onClick={copy}>
              {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <Textarea value={output} readOnly rows={5} className="font-mono text-xs" />
        </div>
      )}
      <p className="text-xs text-muted-foreground">AES-256-GCM · PBKDF2 · 100k iterations · All processing in your browser</p>
    </div>
  );
}
