"use client";
/**
 * Lorem Ipsum Generator
 * Generates placeholder text by paragraphs, sentences, or word count.
 * Uses a hardcoded lorem ipsum word bank — no external dependencies.
 * Auto-generates 3 paragraphs on mount.
 */
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ── Lorem ipsum word bank ─────────────────────────────────────────────────────

const LOREM_WORDS = (
  "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor " +
  "incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud " +
  "exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure " +
  "dolor reprehenderit voluptate velit esse cillum dolore eu fugiat nulla pariatur " +
  "excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt " +
  "mollit anim id est laborum pellentesque habitant morbi tristique senectus netus " +
  "malesuada fames turpis egestas proin nibh aliquam sem fringilla ut morbi tincidunt " +
  "augue interdum velit euismod lacus vel facilisis volutpat est velit egestas dui " +
  "faucibus ornare suspendisse sed nisi lacus sed viverra tellus in hac habitasse " +
  "platea dictumst vestibulum rhoncus est pellentesque elit ullamcorper dignissim cras " +
  "tincidunt lobortis feugiat vivamus at augue eget arcu dictum varius duis ultricies " +
  "lacus sed turpis tincidunt id aliquet risus feugiat in ante metus dictum at tempor " +
  "commodo ullamcorper a lacus vestibulum sed arcu non odio euismod lacinia at quis " +
  "risus sed vulputate odio ut enim blandit volutpat maecenas volutpat blandit aliquam " +
  "etiam erat velit scelerisque in dictum non consectetur a erat nam at lectus urna " +
  "duis convallis convallis tellus id interdum velit laoreet id donec ultrices tincidunt " +
  "arcu non sodales neque sodales ut etiam sit amet nisl purus in mollis nunc sed id " +
  "semper risus in hendrerit gravida rutrum quisque non tellus orci ac auctor augue " +
  "mauris augue neque gravida in fermentum et sollicitudin ac orci phasellus egestas " +
  "tellus rutrum tellus pellentesque eu tincidunt tortor aliquam nulla facilisi cras " +
  "fermentum odio eu feugiat pretium nibh ipsum consequat nisl vel pretium lectus quam " +
  "id leo in vitae turpis massa sed elementum tempus egestas sed sed risus pretium quam " +
  "vulputate dignissim suspendisse in est ante in nibh mauris cursus mattis molestie"
).split(" ");

const LOREM_START =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

// ── Generator utilities ───────────────────────────────────────────────────────

function randomWord(exclude?: string): string {
  let word: string;
  do {
    word = LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];
  } while (exclude && word === exclude);
  return word;
}

function generateSentence(minWords = 8, maxWords = 18): string {
  const count = minWords + Math.floor(Math.random() * (maxWords - minWords + 1));
  const words: string[] = [];
  for (let i = 0; i < count; i++) {
    words.push(randomWord(words[words.length - 1]));
  }
  const sentence = words.join(" ");
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
}

function generateParagraph(sentenceCount = 5): string {
  const count = sentenceCount + Math.floor(Math.random() * 3);
  const sentences: string[] = [];
  for (let i = 0; i < count; i++) {
    sentences.push(generateSentence());
  }
  return sentences.join(" ");
}

function generateWords(count: number): string {
  const words: string[] = [];
  for (let i = 0; i < count; i++) {
    words.push(randomWord(words[words.length - 1]));
  }
  return words.join(" ");
}

type GenerateType = "paragraphs" | "sentences" | "words";

function generate(
  type: GenerateType,
  amount: number,
  startWithLorem: boolean
): string {
  if (type === "paragraphs") {
    const paragraphs: string[] = [];
    for (let i = 0; i < amount; i++) {
      paragraphs.push(generateParagraph());
    }
    if (startWithLorem && paragraphs.length > 0) {
      paragraphs[0] = LOREM_START + " " + paragraphs[0];
    }
    return paragraphs.join("\n\n");
  }

  if (type === "sentences") {
    const sentences: string[] = [];
    for (let i = 0; i < amount; i++) {
      sentences.push(generateSentence());
    }
    const result = sentences.join(" ");
    return startWithLorem ? LOREM_START + " " + result : result;
  }

  // words
  const result = generateWords(amount);
  const capitalized = result.charAt(0).toUpperCase() + result.slice(1);
  return startWithLorem
    ? LOREM_START + " " + capitalized
    : capitalized;
}

// ── Main component ────────────────────────────────────────────────────────────

export default function LoremIpsum() {
  const [type, setType]               = useState<GenerateType>("paragraphs");
  const [amount, setAmount]           = useState(3);
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [output, setOutput]           = useState("");
  const [copied, setCopied]           = useState(false);

  const maxAmount = type === "words" ? 500 : 20;

  const handleGenerate = useCallback(() => {
    setOutput(generate(type, amount, startWithLorem));
  }, [type, amount, startWithLorem]);

  // Auto-generate on mount
  useEffect(() => {
    setOutput(generate("paragraphs", 3, true));
  }, []);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silently fail
    }
  }, [output]);

  const handleTypeChange = (value: string) => {
    const newType = value as GenerateType;
    setType(newType);
    // Clamp amount when switching between words and others
    if (newType === "words") {
      setAmount((prev) => Math.min(prev, 500));
    } else {
      setAmount((prev) => Math.min(prev, 20));
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = parseInt(e.target.value, 10);
    if (isNaN(raw)) return;
    const clamped = Math.max(1, Math.min(raw, maxAmount));
    setAmount(clamped);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Lorem Ipsum Generator</h1>
        <p className="text-sm text-muted-foreground">
          Generate placeholder text by paragraphs, sentences, or word count.
        </p>
      </div>

      {/* ── Controls ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-end gap-4">
        {/* Type select */}
        <div className="flex flex-col gap-1.5 min-w-[150px]">
          <Label htmlFor="lorem-type">Generate by</Label>
          <Select value={type} onValueChange={handleTypeChange}>
            <SelectTrigger id="lorem-type" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="paragraphs">Paragraphs</SelectItem>
              <SelectItem value="sentences">Sentences</SelectItem>
              <SelectItem value="words">Words</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Amount input */}
        <div className="flex flex-col gap-1.5 w-28">
          <Label htmlFor="lorem-amount">Amount</Label>
          <Input
            id="lorem-amount"
            type="number"
            min={1}
            max={maxAmount}
            value={amount}
            onChange={handleAmountChange}
          />
        </div>

        {/* Checkbox */}
        <div className="flex items-center gap-2 pb-1">
          <input
            id="lorem-start"
            type="checkbox"
            className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
            checked={startWithLorem}
            onChange={(e) => setStartWithLorem(e.target.checked)}
          />
          <Label htmlFor="lorem-start" className="cursor-pointer select-none font-normal">
            Start with &ldquo;Lorem ipsum&hellip;&rdquo;
          </Label>
        </div>

        {/* Generate button */}
        <Button onClick={handleGenerate} className="shrink-0">
          Generate
        </Button>
      </div>

      {/* ── Output ───────────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="lorem-output">Generated text</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={!output}
          >
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
        <textarea
          id="lorem-output"
          className="w-full min-h-[240px] resize-y rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-foreground leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
          rows={10}
          readOnly
          value={output}
          aria-label="Generated lorem ipsum text"
        />
      </div>
    </div>
  );
}
