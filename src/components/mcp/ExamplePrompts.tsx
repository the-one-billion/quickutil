"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface Props {
  prompts: string[];
}

export default function ExamplePrompts({ prompts }: Props) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  async function handleCopy(prompt: string, index: number) {
    await navigator.clipboard.writeText(prompt);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }

  return (
    <ul className="space-y-2">
      {prompts.map((prompt, i) => (
        <li
          key={i}
          className="group flex items-start justify-between gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3"
        >
          <span className="text-sm text-foreground leading-relaxed flex-1">
            &ldquo;{prompt}&rdquo;
          </span>
          <button
            onClick={() => handleCopy(prompt, i)}
            className="shrink-0 mt-0.5 rounded p-1 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground transition-all"
            title="Copy prompt"
          >
            {copiedIndex === i ? (
              <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}
