"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ---------------------------------------------------------------------------
// Inline pure-JS MD5 implementation (~50 lines)
// Based on the RSA Data Security, Inc. MD5 algorithm.
// ---------------------------------------------------------------------------

function md5(inputStr: string): string {
  function safeAdd(x: number, y: number): number {
    const lsw = (x & 0xffff) + (y & 0xffff);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xffff);
  }
  function bitRotateLeft(num: number, cnt: number): number {
    return (num << cnt) | (num >>> (32 - cnt));
  }
  function md5cmn(q: number, a: number, b: number, x: number, s: number, t: number): number {
    return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
  }
  function md5ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return md5cmn((b & c) | (~b & d), a, b, x, s, t); }
  function md5gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return md5cmn((b & d) | (c & ~d), a, b, x, s, t); }
  function md5hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return md5cmn(b ^ c ^ d, a, b, x, s, t); }
  function md5ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return md5cmn(c ^ (b | ~d), a, b, x, s, t); }

  function coremd5(M: number[], l: number): number[] {
    const K = [0xd76aa478,0xe8c7b756,0x242070db,0xc1bdceee,0xf57c0faf,0x4787c62a,0xa8304613,0xfd469501,0x698098d8,0x8b44f7af,0xffff5bb1,0x895cd7be,0x6b901122,0xfd987193,0xa679438e,0x49b40821,0xf61e2562,0xc040b340,0x265e5a51,0xe9b6c7aa,0xd62f105d,0x02441453,0xd8a1e681,0xe7d3fbc8,0x21e1cde6,0xc33707d6,0xf4d50d87,0x455a14ed,0xa9e3e905,0xfcefa3f8,0x676f02d9,0x8d2a4c8a,0xfffa3942,0x8771f681,0x6d9d6122,0xfde5380c,0xa4beea44,0x4bdecfa9,0xf6bb4b60,0xbebfbc70,0x289b7ec6,0xeaa127fa,0xd4ef3085,0x04881d05,0xd9d4d039,0xe6db99e5,0x1fa27cf8,0xc4ac5665,0xf4292244,0x432aff97,0xab9423a7,0xfc93a039,0x655b59c3,0x8f0ccc92,0xffeff47d,0x85845dd1,0x6fa87e4f,0xfe2ce6e0,0xa3014314,0x4e0811a1,0xf7537e82,0xbd3af235,0x2ad7d2bb,0xeb86d391];
    let a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476;
    M[l >> 5] |= 0x80 << (l % 32);
    M[(((l + 64) >>> 9) << 4) + 14] = l;
    for (let i = 0; i < M.length; i += 16) {
      const [oa, ob, oc, od] = [a, b, c, d];
      a = md5ff(a,b,c,d,M[i],7,K[0]); d = md5ff(d,a,b,c,M[i+1],12,K[1]); c = md5ff(c,d,a,b,M[i+2],17,K[2]); b = md5ff(b,c,d,a,M[i+3],22,K[3]);
      a = md5ff(a,b,c,d,M[i+4],7,K[4]); d = md5ff(d,a,b,c,M[i+5],12,K[5]); c = md5ff(c,d,a,b,M[i+6],17,K[6]); b = md5ff(b,c,d,a,M[i+7],22,K[7]);
      a = md5ff(a,b,c,d,M[i+8],7,K[8]); d = md5ff(d,a,b,c,M[i+9],12,K[9]); c = md5ff(c,d,a,b,M[i+10],17,K[10]); b = md5ff(b,c,d,a,M[i+11],22,K[11]);
      a = md5ff(a,b,c,d,M[i+12],7,K[12]); d = md5ff(d,a,b,c,M[i+13],12,K[13]); c = md5ff(c,d,a,b,M[i+14],17,K[14]); b = md5ff(b,c,d,a,M[i+15],22,K[15]);
      a = md5gg(a,b,c,d,M[i+1],5,K[16]); d = md5gg(d,a,b,c,M[i+6],9,K[17]); c = md5gg(c,d,a,b,M[i+11],14,K[18]); b = md5gg(b,c,d,a,M[i],20,K[19]);
      a = md5gg(a,b,c,d,M[i+5],5,K[20]); d = md5gg(d,a,b,c,M[i+10],9,K[21]); c = md5gg(c,d,a,b,M[i+15],14,K[22]); b = md5gg(b,c,d,a,M[i+4],20,K[23]);
      a = md5gg(a,b,c,d,M[i+9],5,K[24]); d = md5gg(d,a,b,c,M[i+14],9,K[25]); c = md5gg(c,d,a,b,M[i+3],14,K[26]); b = md5gg(b,c,d,a,M[i+8],20,K[27]);
      a = md5gg(a,b,c,d,M[i+13],5,K[28]); d = md5gg(d,a,b,c,M[i+2],9,K[29]); c = md5gg(c,d,a,b,M[i+7],14,K[30]); b = md5gg(b,c,d,a,M[i+12],20,K[31]);
      a = md5hh(a,b,c,d,M[i+5],4,K[32]); d = md5hh(d,a,b,c,M[i+8],11,K[33]); c = md5hh(c,d,a,b,M[i+11],16,K[34]); b = md5hh(b,c,d,a,M[i+14],23,K[35]);
      a = md5hh(a,b,c,d,M[i+1],4,K[36]); d = md5hh(d,a,b,c,M[i+4],11,K[37]); c = md5hh(c,d,a,b,M[i+7],16,K[38]); b = md5hh(b,c,d,a,M[i+10],23,K[39]);
      a = md5hh(a,b,c,d,M[i+13],4,K[40]); d = md5hh(d,a,b,c,M[i],11,K[41]); c = md5hh(c,d,a,b,M[i+3],16,K[42]); b = md5hh(b,c,d,a,M[i+6],23,K[43]);
      a = md5hh(a,b,c,d,M[i+9],4,K[44]); d = md5hh(d,a,b,c,M[i+12],11,K[45]); c = md5hh(c,d,a,b,M[i+15],16,K[46]); b = md5hh(b,c,d,a,M[i+2],23,K[47]);
      a = md5ii(a,b,c,d,M[i],6,K[48]); d = md5ii(d,a,b,c,M[i+7],10,K[49]); c = md5ii(c,d,a,b,M[i+14],15,K[50]); b = md5ii(b,c,d,a,M[i+5],21,K[51]);
      a = md5ii(a,b,c,d,M[i+12],6,K[52]); d = md5ii(d,a,b,c,M[i+3],10,K[53]); c = md5ii(c,d,a,b,M[i+10],15,K[54]); b = md5ii(b,c,d,a,M[i+1],21,K[55]);
      a = md5ii(a,b,c,d,M[i+8],6,K[56]); d = md5ii(d,a,b,c,M[i+15],10,K[57]); c = md5ii(c,d,a,b,M[i+6],15,K[58]); b = md5ii(b,c,d,a,M[i+13],21,K[59]);
      a = md5ii(a,b,c,d,M[i+4],6,K[60]); d = md5ii(d,a,b,c,M[i+11],10,K[61]); c = md5ii(c,d,a,b,M[i+8],15,K[62]); b = md5ii(b,c,d,a,M[i+9],21,K[63]);
      a = safeAdd(a, oa); b = safeAdd(b, ob); c = safeAdd(c, oc); d = safeAdd(d, od);
    }
    return [a, b, c, d];
  }

  function str2binl(str: string): number[] {
    const bin: number[] = [];
    const mask = (1 << 8) - 1;
    for (let i = 0; i < str.length * 8; i += 8) bin[i >> 5] |= (str.charCodeAt(i / 8) & mask) << (i % 32);
    return bin;
  }

  function binl2hex(binarray: number[]): string {
    const hexTab = "0123456789abcdef";
    let str = "";
    for (let i = 0; i < binarray.length * 4; i++) {
      str += hexTab.charAt((binarray[i >> 2] >> ((i % 4) * 8 + 4)) & 0xf) + hexTab.charAt((binarray[i >> 2] >> ((i % 4) * 8)) & 0xf);
    }
    return str;
  }

  // Encode to Latin-1 for md5 internal processing
  const encoded = unescape(encodeURIComponent(inputStr));
  return binl2hex(coremd5(str2binl(encoded), encoded.length * 8));
}

// ---------------------------------------------------------------------------
// SHA hashing via Web Crypto API
// ---------------------------------------------------------------------------

type Algorithm = "MD5" | "SHA-1" | "SHA-256" | "SHA-512";

async function computeHash(
  data: string | Uint8Array,
  algorithm: Algorithm,
  hmac: boolean,
  secret: string
): Promise<string> {
  const rawBytes: Uint8Array =
    typeof data === "string" ? new TextEncoder().encode(data) : data;
  // Cast to Uint8Array<ArrayBuffer> so Web Crypto API accepts it as BufferSource
  const bytes = rawBytes.buffer instanceof ArrayBuffer
    ? (rawBytes as Uint8Array<ArrayBuffer>)
    : new Uint8Array(rawBytes) as Uint8Array<ArrayBuffer>;

  if (algorithm === "MD5") {
    const text = typeof data === "string" ? data : new TextDecoder().decode(data);
    return md5(text);
  }

  const subtleAlgo = algorithm; // "SHA-1" | "SHA-256" | "SHA-512"

  if (hmac && secret) {
    const keyBytes = new TextEncoder().encode(secret);
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyBytes,
      { name: "HMAC", hash: subtleAlgo },
      false,
      ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", cryptoKey, bytes);
    return Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  const hashBuf = await crypto.subtle.digest(subtleAlgo, bytes);
  return Array.from(new Uint8Array(hashBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function HashGenerator() {
  const [inputText, setInputText] = useState("");
  const [algorithm, setAlgorithm] = useState<Algorithm>("SHA-256");
  const [hash, setHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [useHmac, setUseHmac] = useState(false);
  const [secret, setSecret] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const [fileDragging, setFileDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isShaAlgo = algorithm !== "MD5";

  const computeAndSet = useCallback(
    async (data: string | Uint8Array, algo: Algorithm, hmac: boolean, sec: string) => {
      setLoading(true);
      setHash("");
      try {
        const result = await computeHash(data, algo, hmac && algo !== "MD5", sec);
        setHash(result);
      } catch (e) {
        setHash(`Error: ${e instanceof Error ? e.message : "Unknown error"}`);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  function triggerHash(
    text: string,
    bytes: Uint8Array | null,
    algo: Algorithm,
    hmac: boolean,
    sec: string
  ) {
    const data = bytes ?? text;
    if (!text && !bytes) {
      setHash("");
      return;
    }
    void computeAndSet(data, algo, hmac, sec);
  }

  function handleTextChange(value: string) {
    setInputText(value);
    setFileBytes(null);
    setFileName(null);
    triggerHash(value, null, algorithm, useHmac, secret);
  }

  function handleAlgoChange(algo: Algorithm) {
    setAlgorithm(algo);
    triggerHash(inputText, fileBytes, algo, useHmac, secret);
  }

  function handleHmacChange(enabled: boolean) {
    setUseHmac(enabled);
    triggerHash(inputText, fileBytes, algorithm, enabled, secret);
  }

  function handleSecretChange(value: string) {
    setSecret(value);
    triggerHash(inputText, fileBytes, algorithm, useHmac, value);
  }

  function loadFile(file: File) {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (result instanceof ArrayBuffer) {
        const bytes = new Uint8Array(result);
        setFileBytes(bytes);
        setInputText("");
        void computeAndSet(bytes, algorithm, useHmac && isShaAlgo, secret);
      }
    };
    reader.readAsArrayBuffer(file);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setFileDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) loadFile(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
  }

  async function copyHash() {
    if (!hash) return;
    await navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function clearAll() {
    setInputText("");
    setFileBytes(null);
    setFileName(null);
    setHash("");
    setUseHmac(false);
    setSecret("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const algorithms: Algorithm[] = ["MD5", "SHA-1", "SHA-256", "SHA-512"];

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Hash Generator</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Compute MD5, SHA-1, SHA-256, or SHA-512 hashes from text or files. Supports HMAC for SHA variants.
        </p>
      </div>

      {/* Algorithm selector */}
      <div className="space-y-2">
        <Label className="text-foreground">Algorithm</Label>
        <Tabs
          value={algorithm}
          onValueChange={(v) => handleAlgoChange(v as Algorithm)}
        >
          <TabsList className="w-full">
            {algorithms.map((algo) => (
              <TabsTrigger key={algo} value={algo} className="flex-1">
                {algo}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Text input */}
      <div className="space-y-2">
        <Label className="text-foreground">Text Input</Label>
        <textarea
          value={inputText}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Enter text to hash..."
          rows={5}
          disabled={!!fileBytes}
          spellCheck={false}
          className="w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {fileBytes && (
          <p className="text-xs text-muted-foreground">
            Using file: <span className="font-medium text-foreground">{fileName}</span>.{" "}
            <button
              type="button"
              onClick={clearAll}
              className="text-primary underline underline-offset-2"
            >
              Clear
            </button>
          </p>
        )}
      </div>

      {/* File drop zone */}
      <div className="space-y-1">
        <Label className="text-muted-foreground text-xs uppercase tracking-wider">Or use a file</Label>
        <div
          onDragOver={(e) => { e.preventDefault(); setFileDragging(true); }}
          onDragLeave={() => setFileDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors cursor-pointer ${
            fileDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm text-muted-foreground">
            Drop a file here or{" "}
            <span className="text-primary underline underline-offset-2">click to select</span>
          </p>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* HMAC section */}
      <div className="space-y-3 rounded-lg border border-border p-4">
        <div className="flex items-center gap-3">
          <Switch
            id="hmac-toggle"
            checked={useHmac}
            onCheckedChange={handleHmacChange}
            disabled={!isShaAlgo}
          />
          <div>
            <Label
              htmlFor="hmac-toggle"
              className={`cursor-pointer text-sm ${!isShaAlgo ? "text-muted-foreground" : "text-foreground"}`}
            >
              Use HMAC
            </Label>
            {!isShaAlgo && (
              <p className="text-xs text-muted-foreground">HMAC is not available for MD5</p>
            )}
          </div>
        </div>
        {useHmac && isShaAlgo && (
          <div className="space-y-1">
            <Label htmlFor="hmac-secret" className="text-sm text-foreground">
              Secret Key
            </Label>
            <Input
              id="hmac-secret"
              type="text"
              value={secret}
              onChange={(e) => handleSecretChange(e.target.value)}
              placeholder="Enter HMAC secret..."
              className="font-mono bg-background border-border text-foreground"
            />
          </div>
        )}
      </div>

      {/* Hash output */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-foreground">
            Hash Output
            {loading && (
              <span className="ml-2 inline-flex items-center gap-1 text-xs font-normal text-muted-foreground">
                <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Computing...
              </span>
            )}
          </Label>
          <Button
            variant="outline"
            size="sm"
            onClick={copyHash}
            disabled={!hash || loading}
            className="border-border"
          >
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
        <Input
          readOnly
          value={loading ? "" : hash}
          placeholder={loading ? "Computing hash..." : "Hash will appear here..."}
          className="font-mono text-xs bg-muted/40 border-border text-foreground"
        />
        {hash && !loading && (
          <p className="text-xs text-muted-foreground">
            {algorithm} · {hash.length * 4} bits · {hash.length} hex chars
          </p>
        )}
      </div>
    </div>
  );
}
