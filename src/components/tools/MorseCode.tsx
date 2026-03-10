"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Full Morse code table
const MORSE_MAP: Record<string, string> = {
  A: ".-",    B: "-...",  C: "-.-.",  D: "-..",
  E: ".",     F: "..-.",  G: "--.",   H: "....",
  I: "..",    J: ".---",  K: "-.-",   L: ".-..",
  M: "--",    N: "-.",    O: "---",   P: ".--.",
  Q: "--.-",  R: ".-.",   S: "...",   T: "-",
  U: "..-",   V: "...-",  W: ".--",   X: "-..-",
  Y: "-.--",  Z: "--..",
  "0": "-----", "1": ".----", "2": "..---", "3": "...--",
  "4": "....-", "5": ".....", "6": "-....", "7": "--...",
  "8": "---..", "9": "----.",
  ".": ".-.-.-", ",": "--..--", "?": "..--..", "!": "-.-.--",
  "/": "-..-.",  "-": "-....-", "=": "-...-",  "+": ".-.-.",
  "@": ".--.-.", "&": ".-...",  ":": "---...",  ";": "-.-.-.",
  "(": "-.--.",  ")": "-.--.-", '"': ".-..-.",  "'": ".----.",
};

// Reverse map: morse -> char
const REVERSE_MORSE: Record<string, string> = Object.fromEntries(
  Object.entries(MORSE_MAP).map(([k, v]) => [v, k])
);

function textToMorse(text: string): string {
  return text
    .toUpperCase()
    .split("")
    .map((ch) => {
      if (ch === " ") return "/";
      return MORSE_MAP[ch] ?? "[?]";
    })
    .join(" ");
}

function morseToText(morse: string): string {
  return morse
    .split(" / ")
    .map((word) =>
      word
        .split(" ")
        .map((code) => {
          if (!code) return "";
          return REVERSE_MORSE[code] ?? "[?]";
        })
        .join("")
    )
    .join(" ");
}

function isMorse(input: string): boolean {
  const trimmed = input.trim();
  if (!trimmed) return false;
  return /^[.\-/ ]+$/.test(trimmed);
}

// Per-letter breakdown: array of { char, morse }
interface LetterMorse {
  char: string;
  morse: string;
}

function getLetterBreakdown(text: string): LetterMorse[] {
  return text
    .toUpperCase()
    .split("")
    .map((ch) => ({
      char: ch,
      morse:
        ch === " "
          ? "/"
          : MORSE_MAP[ch]
          ? MORSE_MAP[ch]
          : ch === "\n"
          ? "↵"
          : "[?]",
    }))
    .filter((l) => l.char !== "\n");
}

// Morse audio utilities
function createAudioContext(): AudioContext {
  return new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
}

function wpmToUnitMs(wpm: number): number {
  // Standard PARIS timing: 1 WPM = 1200ms per unit
  return 1200 / wpm;
}

async function playMorseAudio(
  morseString: string,
  wpm: number,
  freq: number,
  stopSignal: { stopped: boolean },
  onCharIndex: (idx: number | null) => void,
  letterBreakdown: LetterMorse[]
): Promise<void> {
  const ctx = createAudioContext();
  const unit = wpmToUnitMs(wpm);
  const dot = unit;
  const dash = 3 * unit;
  const symbolGap = unit;
  const letterGap = 3 * unit;
  const wordGap = 7 * unit;

  // Build a play queue: [charIndex, signal(. or -), duration_ms]
  type AudioEvent =
    | { type: "tone"; duration: number; charIndex: number }
    | { type: "gap"; duration: number; charIndex: number | null };

  const queue: AudioEvent[] = [];
  let letterIndex = 0;

  for (let i = 0; i < morseString.length; i++) {
    const sym = morseString[i];
    if (sym === ".") {
      queue.push({ type: "tone", duration: dot, charIndex: letterIndex });
      queue.push({ type: "gap", duration: symbolGap, charIndex: letterIndex });
    } else if (sym === "-") {
      queue.push({ type: "tone", duration: dash, charIndex: letterIndex });
      queue.push({ type: "gap", duration: symbolGap, charIndex: letterIndex });
    } else if (sym === " ") {
      // If next is "/", it's a word gap, handled below
      const next = morseString[i + 1];
      if (next === "/") {
        // word gap: handled at "/"
      } else {
        // letter gap
        queue.push({ type: "gap", duration: letterGap - symbolGap, charIndex: letterIndex });
        letterIndex++;
      }
    } else if (sym === "/") {
      // word gap
      queue.push({ type: "gap", duration: wordGap, charIndex: null });
      letterIndex++;
    }
  }
  queue.push({ type: "gap", duration: 0, charIndex: null });

  // Play queue sequentially
  for (const event of queue) {
    if (stopSignal.stopped) break;

    if (event.type === "tone") {
      onCharIndex(event.charIndex);
      await new Promise<void>((resolve) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.005);
        gain.gain.setValueAtTime(0.4, ctx.currentTime + event.duration / 1000 - 0.005);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + event.duration / 1000);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + event.duration / 1000);
        osc.onended = () => resolve();
      });
    } else {
      if (event.duration > 0) {
        await new Promise<void>((resolve) =>
          setTimeout(resolve, event.duration)
        );
      }
    }
  }

  onCharIndex(null);
  ctx.close();
}

const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS = "0123456789";
const PUNCT = ".,?!/-=+@&:;()'\"";

export default function MorseCode() {
  const [textInput, setTextInput] = useState("HELLO WORLD");
  const [morseInput, setMorseInput] = useState("");
  const [direction, setDirection] = useState<"text-to-morse" | "morse-to-text">(
    "text-to-morse"
  );
  const [activeTab, setActiveTab] = useState<"translate" | "reference">(
    "translate"
  );
  const [wpm, setWpm] = useState(15);
  const [freq, setFreq] = useState(600);
  const [playing, setPlaying] = useState(false);
  const [activeCharIndex, setActiveCharIndex] = useState<number | null>(null);
  const stopRef = useRef<{ stopped: boolean }>({ stopped: false });
  const [copied, setCopied] = useState(false);

  const currentMorse =
    direction === "text-to-morse" ? textToMorse(textInput) : morseInput.trim();
  const currentText =
    direction === "morse-to-text" ? morseToText(morseInput) : textInput;
  const letterBreakdown =
    direction === "text-to-morse" ? getLetterBreakdown(textInput) : [];

  const displayMorse =
    direction === "text-to-morse" ? currentMorse : morseInput;
  const displayText =
    direction === "text-to-morse" ? textInput : currentText;

  const handlePlay = useCallback(async () => {
    if (playing) return;
    const morse =
      direction === "text-to-morse"
        ? textToMorse(textInput)
        : morseInput.trim();
    if (!morse) return;

    setPlaying(true);
    stopRef.current = { stopped: false };

    await playMorseAudio(
      morse,
      wpm,
      freq,
      stopRef.current,
      setActiveCharIndex,
      letterBreakdown
    );

    setPlaying(false);
    setActiveCharIndex(null);
  }, [playing, direction, textInput, morseInput, wpm, freq, letterBreakdown]);

  const handleStop = useCallback(() => {
    stopRef.current.stopped = true;
    setPlaying(false);
    setActiveCharIndex(null);
  }, []);

  const handlePlayChar = useCallback(
    async (char: string) => {
      const morse = MORSE_MAP[char.toUpperCase()];
      if (!morse) return;
      const stop = { stopped: false };
      await playMorseAudio(
        morse,
        wpm,
        freq,
        stop,
        () => {},
        []
      );
    },
    [wpm, freq]
  );

  const handleCopy = useCallback(() => {
    const val = direction === "text-to-morse" ? currentMorse : currentText;
    navigator.clipboard.writeText(val).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [direction, currentMorse, currentText]);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "translate" | "reference")}
      >
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="translate">Translator</TabsTrigger>
          <TabsTrigger value="reference">Reference</TabsTrigger>
        </TabsList>

        <TabsContent value="translate" className="space-y-5 mt-4">
          {/* Direction Toggle */}
          <div className="flex gap-2">
            <Button
              variant={direction === "text-to-morse" ? "default" : "outline"}
              size="sm"
              onClick={() => setDirection("text-to-morse")}
            >
              Text → Morse
            </Button>
            <Button
              variant={direction === "morse-to-text" ? "default" : "outline"}
              size="sm"
              onClick={() => setDirection("morse-to-text")}
            >
              Morse → Text
            </Button>
          </div>

          {/* Input */}
          <div className="space-y-2">
            <Label className="text-sm">
              {direction === "text-to-morse" ? "Text Input" : "Morse Input"}
            </Label>
            {direction === "text-to-morse" ? (
              <Input
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Type text here..."
                className="font-mono"
              />
            ) : (
              <Input
                value={morseInput}
                onChange={(e) => setMorseInput(e.target.value)}
                placeholder="Enter morse code (dots, dashes, spaces, / for word gap)..."
                className="font-mono"
              />
            )}
          </div>

          {/* Output */}
          <div className="rounded-lg border bg-muted p-4 space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm text-muted-foreground">
                {direction === "text-to-morse" ? "Morse Code" : "Decoded Text"}
              </Label>
              <Button variant="ghost" size="sm" onClick={handleCopy}>
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
            <p className="font-mono text-sm break-all leading-relaxed">
              {direction === "text-to-morse" ? currentMorse || "—" : currentText || "—"}
            </p>
          </div>

          {/* Letter-by-letter breakdown */}
          {direction === "text-to-morse" && letterBreakdown.length > 0 && (
            <div className="rounded-lg border bg-card p-4 space-y-2">
              <Label className="text-sm text-muted-foreground">
                Character Breakdown
              </Label>
              <div className="flex flex-wrap gap-2">
                {letterBreakdown.map((item, i) => (
                  <div
                    key={i}
                    className={`flex flex-col items-center rounded-md border px-2 py-1.5 min-w-[2.5rem] transition-colors ${
                      activeCharIndex === i
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted"
                    }`}
                  >
                    <span className="text-xs font-bold leading-tight">
                      {item.char === " " ? "SPC" : item.char}
                    </span>
                    <span className="text-[10px] font-mono leading-tight text-muted-foreground mt-0.5">
                      {item.morse}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audio Controls */}
          <div className="rounded-lg border bg-card p-4 space-y-4">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Audio Playback
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Speed</Label>
                  <span className="text-sm font-medium tabular-nums">
                    {wpm} WPM
                  </span>
                </div>
                <Slider
                  min={5}
                  max={30}
                  step={1}
                  value={[wpm]}
                  onValueChange={(v) => setWpm(v[0])}
                  disabled={playing}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>5</span>
                  <span>30</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Frequency</Label>
                  <span className="text-sm font-medium tabular-nums">
                    {freq} Hz
                  </span>
                </div>
                <Slider
                  min={400}
                  max={800}
                  step={10}
                  value={[freq]}
                  onValueChange={(v) => setFreq(v[0])}
                  disabled={playing}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>400</span>
                  <span>800</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handlePlay}
                disabled={playing || !currentMorse}
                className="gap-2"
              >
                {playing ? (
                  <>
                    <span className="inline-block animate-pulse">▶</span>{" "}
                    Playing...
                  </>
                ) : (
                  "▶ Play"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleStop}
                disabled={!playing}
              >
                ■ Stop
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reference" className="mt-4">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Click any row to hear that character's Morse code.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Alphabet */}
              <div className="rounded-lg border bg-card overflow-hidden">
                <div className="bg-muted px-3 py-2">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Alphabet
                  </p>
                </div>
                <div className="divide-y">
                  {ALPHA.split("").map((ch) => (
                    <ReferenceRow
                      key={ch}
                      char={ch}
                      morse={MORSE_MAP[ch]}
                      onPlay={() => handlePlayChar(ch)}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {/* Digits */}
                <div className="rounded-lg border bg-card overflow-hidden">
                  <div className="bg-muted px-3 py-2">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      Numbers
                    </p>
                  </div>
                  <div className="divide-y">
                    {DIGITS.split("").map((ch) => (
                      <ReferenceRow
                        key={ch}
                        char={ch}
                        morse={MORSE_MAP[ch]}
                        onPlay={() => handlePlayChar(ch)}
                      />
                    ))}
                  </div>
                </div>

                {/* Punctuation */}
                <div className="rounded-lg border bg-card overflow-hidden">
                  <div className="bg-muted px-3 py-2">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      Punctuation
                    </p>
                  </div>
                  <div className="divide-y">
                    {PUNCT.split("").map((ch) => (
                      <ReferenceRow
                        key={ch}
                        char={ch}
                        morse={MORSE_MAP[ch.toUpperCase()] ?? MORSE_MAP[ch]}
                        onPlay={() => handlePlayChar(ch)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ReferenceRow({
  char,
  morse,
  onPlay,
}: {
  char: string;
  morse: string;
  onPlay: () => void;
}) {
  return (
    <button
      className="w-full flex items-center justify-between px-3 py-2 hover:bg-muted/60 transition-colors text-left group"
      onClick={onPlay}
      title={`Play ${char}`}
    >
      <div className="flex items-center gap-3">
        <span className="font-bold w-6 text-center">{char}</span>
        <span className="font-mono text-sm text-muted-foreground tracking-widest">
          {morse}
        </span>
      </div>
      <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
        ▶
      </span>
    </button>
  );
}
