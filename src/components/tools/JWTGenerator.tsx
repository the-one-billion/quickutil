"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Copy, Check } from "lucide-react";

type Alg = "HS256" | "HS384" | "HS512";
const ALG_MAP: Record<Alg, string> = { HS256: "SHA-256", HS384: "SHA-384", HS512: "SHA-512" };

function b64url(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}

function encodeObj(obj: unknown): string {
  return b64url(new TextEncoder().encode(JSON.stringify(obj)).buffer as ArrayBuffer);
}

async function signJWT(header: object, payload: object, secret: string, alg: Alg): Promise<string> {
  const signingInput = `${encodeObj(header)}.${encodeObj(payload)}`;
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: ALG_MAP[alg] },
    false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signingInput));
  return `${signingInput}.${b64url(sig)}`;
}

const DEFAULT_PAYLOAD = JSON.stringify({ sub: "1234567890", name: "Alice", iat: Math.floor(Date.now()/1000) }, null, 2);

export default function JWTGenerator() {
  const [alg, setAlg]         = useState<Alg>("HS256");
  const [secret, setSecret]   = useState("your-secret-key");
  const [payload, setPayload] = useState(DEFAULT_PAYLOAD);
  const [token, setToken]     = useState("");
  const [error, setError]     = useState("");
  const [copied, setCopied]   = useState(false);

  const generate = async () => {
    setError("");
    try {
      const parsedPayload = JSON.parse(payload);
      const header = { alg, typ: "JWT" };
      const jwt = await signJWT(header, parsedPayload, secret, alg);
      setToken(jwt);
    } catch (e) {
      setError(e instanceof SyntaxError ? "Invalid JSON in payload" : String(e));
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const parts = token.split(".");

  return (
    <div className="space-y-4 max-w-lg">
      <div className="flex gap-2">
        {(["HS256","HS384","HS512"] as Alg[]).map(a => (
          <Button key={a} variant={alg === a ? "default" : "outline"} size="sm" onClick={() => setAlg(a)}>{a}</Button>
        ))}
      </div>
      <div>
        <Label className="mb-1 block">Secret Key</Label>
        <Input type="text" value={secret} onChange={e => setSecret(e.target.value)} className="font-mono" />
      </div>
      <div>
        <Label className="mb-1 block">Payload (JSON)</Label>
        <Textarea value={payload} onChange={e => setPayload(e.target.value)} rows={6} className="font-mono text-xs" />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button onClick={generate}>Generate JWT</Button>

      {token && (
        <div className="space-y-3">
          <div className="rounded-lg border bg-muted/30 p-3 font-mono text-xs break-all leading-relaxed">
            <span className="text-red-500">{parts[0]}</span>
            <span className="text-muted-foreground">.</span>
            <span className="text-violet-500">{parts[1]}</span>
            <span className="text-muted-foreground">.</span>
            <span className="text-cyan-500">{parts[2]}</span>
          </div>
          <div className="flex gap-2 flex-wrap text-xs">
            <Badge variant="secondary" className="text-red-500">Header</Badge>
            <Badge variant="secondary" className="text-violet-500">Payload</Badge>
            <Badge variant="secondary" className="text-cyan-500">Signature</Badge>
          </div>
          <Button variant="outline" size="sm" onClick={copy}>
            {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
            {copied ? "Copied" : "Copy Token"}
          </Button>
        </div>
      )}
    </div>
  );
}
