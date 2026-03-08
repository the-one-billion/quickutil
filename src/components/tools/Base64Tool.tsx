"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// UTF-8 safe encode: string -> base64
function encodeBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

// UTF-8 safe decode: base64 -> string (throws on invalid input)
function decodeBase64(b64: string): string {
  const binary = atob(b64); // throws if invalid
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function encodeFileBytes(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

type TabMode = "encode" | "decode";

interface PanelState {
  input: string;
  output: string;
  error: string;
  copied: boolean;
}

const emptyPanel = (): PanelState => ({ input: "", output: "", error: "", copied: false });

export default function Base64Tool() {
  const [encodeState, setEncodeState] = useState<PanelState>(emptyPanel());
  const [decodeState, setDecodeState] = useState<PanelState>(emptyPanel());
  const [activeTab, setActiveTab] = useState<TabMode>("encode");
  const [fileDragging, setFileDragging] = useState(false);

  const state = activeTab === "encode" ? encodeState : decodeState;
  const setState = activeTab === "encode" ? setEncodeState : setDecodeState;

  const handleInput = useCallback(
    (value: string) => {
      if (activeTab === "encode") {
        try {
          const output = encodeBase64(value);
          setEncodeState({ input: value, output, error: "", copied: false });
        } catch {
          setEncodeState({ input: value, output: "", error: "Encoding failed.", copied: false });
        }
      } else {
        try {
          const output = decodeBase64(value.trim());
          setDecodeState({ input: value, output, error: "", copied: false });
        } catch {
          setDecodeState({ input: value, output: "", error: "Invalid Base64 input.", copied: false });
        }
      }
    },
    [activeTab]
  );

  async function copyOutput() {
    if (!state.output) return;
    await navigator.clipboard.writeText(state.output);
    setState((prev) => ({ ...prev, copied: true }));
    setTimeout(() => setState((prev) => ({ ...prev, copied: false })), 2000);
  }

  function swap() {
    handleInput(state.output);
    // Also set input field value via handleInput which derives output
    // We need to manually flip: put current output into the input field
    if (activeTab === "encode") {
      const newInput = encodeState.output;
      try {
        const newOutput = encodeBase64(newInput);
        setEncodeState({ input: newInput, output: newOutput, error: "", copied: false });
      } catch {
        setEncodeState({ input: newInput, output: "", error: "Encoding failed.", copied: false });
      }
    } else {
      const newInput = decodeState.output;
      try {
        const newOutput = decodeBase64(newInput.trim());
        setDecodeState({ input: newInput, output: newOutput, error: "", copied: false });
      } catch {
        setDecodeState({ input: newInput, output: "", error: "Invalid Base64 input.", copied: false });
      }
    }
  }

  function handleFileRead(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (result instanceof ArrayBuffer) {
        const bytes = new Uint8Array(result);
        if (activeTab === "encode") {
          const output = encodeFileBytes(bytes);
          setEncodeState({ input: `[File: ${file.name}]`, output, error: "", copied: false });
        } else {
          // For decode, read as text and try to decode base64
          const text = new TextDecoder().decode(bytes);
          try {
            const output = decodeBase64(text.trim());
            setDecodeState({ input: text, output, error: "", copied: false });
          } catch {
            setDecodeState({ input: text, output: "", error: "File does not contain valid Base64.", copied: false });
          }
        }
      }
    };
    reader.readAsArrayBuffer(file);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setFileDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileRead(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFileRead(file);
  }

  const tabLabel = activeTab === "encode" ? "Text to encode" : "Base64 to decode";
  const outputLabel = activeTab === "encode" ? "Base64 output" : "Decoded text";

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Base64 Encoder / Decoder</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Encode text or files to Base64, or decode Base64 back to text. Supports UTF-8.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabMode)}>
        <TabsList className="w-full">
          <TabsTrigger value="encode" className="flex-1">Encode</TabsTrigger>
          <TabsTrigger value="decode" className="flex-1">Decode</TabsTrigger>
        </TabsList>

        {(["encode", "decode"] as TabMode[]).map((tab) => {
          const tabState = tab === "encode" ? encodeState : decodeState;
          const tabSetState = tab === "encode" ? setEncodeState : setDecodeState;
          const isActive = activeTab === tab;

          return (
            <TabsContent key={tab} value={tab} className="space-y-4 mt-4">
              {/* Input */}
              <div className="space-y-2">
                <Label className="text-foreground">{tabLabel}</Label>
                <textarea
                  value={tabState.input}
                  onChange={(e) => isActive && handleInput(e.target.value)}
                  placeholder={
                    tab === "encode"
                      ? "Enter text to encode..."
                      : "Enter Base64 string to decode..."
                  }
                  rows={5}
                  className="w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Error */}
              {tabState.error && (
                <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500">
                  {tabState.error}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (isActive) swap();
                  }}
                  disabled={!tabState.output}
                  className="border-border"
                >
                  Swap Output → Input
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (isActive) {
                      tabSetState(emptyPanel());
                    }
                  }}
                  disabled={!tabState.input && !tabState.output}
                  className="border-border"
                >
                  Clear
                </Button>
              </div>

              {/* Output */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-foreground">{outputLabel}</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => isActive && copyOutput()}
                    disabled={!tabState.output}
                    className="border-border"
                  >
                    {tabState.copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
                <textarea
                  readOnly
                  value={tabState.output}
                  rows={5}
                  placeholder="Output will appear here..."
                  className="w-full resize-y rounded-md border border-border bg-muted/40 px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>

              {/* File drop zone */}
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wider">Or use a file</Label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setFileDragging(true); }}
                  onDragLeave={() => setFileDragging(false)}
                  onDrop={isActive ? handleDrop : undefined}
                  className={`relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors cursor-pointer ${
                    fileDragging && isActive
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
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={isActive ? handleFileChange : undefined}
                  />
                </div>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
