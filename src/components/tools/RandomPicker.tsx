"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

type Mode = "pick" | "shuffle" | "groups" | "yesno";

interface HistoryEntry {
  mode: Mode;
  input: string[];
  result: string | string[] | string[][];
  timestamp: number;
}

const QUICK_LISTS: { label: string; items: string[] }[] = [
  {
    label: "Days of Week",
    items: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
  },
  {
    label: "Months",
    items: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
  },
  {
    label: "Numbers 1-10",
    items: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
  },
  { label: "Coin", items: ["Heads", "Tails"] },
  { label: "Rock/Paper/Scissors", items: ["Rock", "Paper", "Scissors"] },
];

function secureRandom(): number {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] / (0xffffffff + 1);
}

function secureShuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const arr32 = new Uint32Array(1);
    crypto.getRandomValues(arr32);
    const j = arr32[0] % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function securePick<T>(arr: T[], n: number, allowDuplicates: boolean): T[] {
  if (allowDuplicates) {
    const result: T[] = [];
    for (let i = 0; i < n; i++) {
      const idx = Math.floor(secureRandom() * arr.length);
      result.push(arr[idx]);
    }
    return result;
  }
  return secureShuffle(arr).slice(0, n);
}

function parseItems(raw: string): string[] {
  if (!raw.trim()) return [];
  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length > 1) return lines;
  if (raw.includes(",")) return raw.split(",").map((s) => s.trim()).filter(Boolean);
  return lines;
}

function splitIntoGroups(items: string[], n: number): string[][] {
  const shuffled = secureShuffle(items);
  const groups: string[][] = Array.from({ length: n }, () => []);
  shuffled.forEach((item, i) => groups[i % n].push(item));
  return groups;
}

export default function RandomPicker() {
  const [rawInput, setRawInput] = useState("");
  const [pickCount, setPickCount] = useState(1);
  const [allowDuplicates, setAllowDuplicates] = useState(false);
  const [groupCount, setGroupCount] = useState(2);
  const [result, setResult] = useState<
    | { type: "pick"; items: string[] }
    | { type: "shuffle"; items: string[] }
    | { type: "groups"; groups: string[][] }
    | { type: "yesno"; answer: string }
    | null
  >(null);
  const [celebrating, setCelebrating] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [activeTab, setActiveTab] = useState<Mode>("pick");

  const celebrate = useCallback(() => {
    setCelebrating(false);
    setTimeout(() => setCelebrating(true), 10);
    setTimeout(() => setCelebrating(false), 800);
  }, []);

  const doSpin = useCallback((cb: () => void) => {
    setSpinning(true);
    setTimeout(() => {
      setSpinning(false);
      cb();
    }, 500);
  }, []);

  const handlePick = useCallback(() => {
    const items = parseItems(rawInput);
    if (items.length === 0) return;
    const n = allowDuplicates
      ? Math.max(1, pickCount)
      : Math.min(pickCount, items.length);
    doSpin(() => {
      const picked = securePick(items, n, allowDuplicates);
      setResult({ type: "pick", items: picked });
      celebrate();
      setHistory((prev) =>
        [{ mode: "pick" as Mode, input: items, result: picked, timestamp: Date.now() }, ...prev].slice(0, 10)
      );
    });
  }, [rawInput, pickCount, allowDuplicates, doSpin, celebrate]);

  const handleShuffle = useCallback(() => {
    const items = parseItems(rawInput);
    if (items.length === 0) return;
    doSpin(() => {
      const shuffled = secureShuffle(items);
      setResult({ type: "shuffle", items: shuffled });
      celebrate();
      setHistory((prev) =>
        [{ mode: "shuffle" as Mode, input: items, result: shuffled, timestamp: Date.now() }, ...prev].slice(0, 10)
      );
    });
  }, [rawInput, doSpin, celebrate]);

  const handleGroups = useCallback(() => {
    const items = parseItems(rawInput);
    if (items.length === 0) return;
    const n = Math.max(2, Math.min(groupCount, items.length));
    doSpin(() => {
      const groups = splitIntoGroups(items, n);
      setResult({ type: "groups", groups });
      celebrate();
      setHistory((prev) =>
        [{ mode: "groups" as Mode, input: items, result: groups, timestamp: Date.now() }, ...prev].slice(0, 10)
      );
    });
  }, [rawInput, groupCount, doSpin, celebrate]);

  const handleYesNo = useCallback(() => {
    doSpin(() => {
      const answer = secureRandom() < 0.5 ? "Yes" : "No";
      setResult({ type: "yesno", answer });
      celebrate();
      setHistory((prev) =>
        [{ mode: "yesno" as Mode, input: [], result: answer, timestamp: Date.now() }, ...prev].slice(0, 10)
      );
    });
  }, [doSpin, celebrate]);

  const items = parseItems(rawInput);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <style>{`
        @keyframes celebrate {
          0%   { transform: scale(1); }
          30%  { transform: scale(1.12); }
          60%  { transform: scale(0.96); }
          100% { transform: scale(1); }
        }
        @keyframes spinWheel {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(720deg); }
        }
        .celebrate-anim { animation: celebrate 0.8s cubic-bezier(0.4,0,0.2,1); }
        .spin-anim { animation: spinWheel 0.5s cubic-bezier(0.4,0,0.2,1); }
      `}</style>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Mode)}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="pick">Random Pick</TabsTrigger>
          <TabsTrigger value="shuffle">Shuffle</TabsTrigger>
          <TabsTrigger value="groups">Split Groups</TabsTrigger>
          <TabsTrigger value="yesno">Yes or No</TabsTrigger>
        </TabsList>

        {/* Shared input (for pick/shuffle/groups) */}
        <TabsContent value="pick" className="space-y-4 mt-4">
          <SharedInput
            rawInput={rawInput}
            setRawInput={setRawInput}
            items={items}
          />
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1">
              <Label className="text-sm">Number of picks</Label>
              <Input
                type="number"
                min={1}
                max={allowDuplicates ? 1000 : items.length || 1}
                value={pickCount}
                onChange={(e) =>
                  setPickCount(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="w-24"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="allowDup"
                checked={allowDuplicates}
                onChange={(e) => setAllowDuplicates(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <Label htmlFor="allowDup" className="text-sm cursor-pointer">
                Allow duplicates
              </Label>
            </div>
            <Button
              size="lg"
              onClick={handlePick}
              disabled={items.length === 0 || spinning}
              className="gap-2"
            >
              <span className={spinning ? "spin-anim inline-block" : "inline-block"}>
                🎰
              </span>
              Pick!
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="shuffle" className="space-y-4 mt-4">
          <SharedInput
            rawInput={rawInput}
            setRawInput={setRawInput}
            items={items}
          />
          <Button
            size="lg"
            onClick={handleShuffle}
            disabled={items.length === 0 || spinning}
            className="gap-2"
          >
            <span className={spinning ? "spin-anim inline-block" : "inline-block"}>
              🔀
            </span>
            Shuffle!
          </Button>
        </TabsContent>

        <TabsContent value="groups" className="space-y-4 mt-4">
          <SharedInput
            rawInput={rawInput}
            setRawInput={setRawInput}
            items={items}
          />
          <div className="flex items-end gap-4">
            <div className="space-y-1">
              <Label className="text-sm">Number of groups</Label>
              <Input
                type="number"
                min={2}
                max={Math.max(2, items.length)}
                value={groupCount}
                onChange={(e) =>
                  setGroupCount(Math.max(2, parseInt(e.target.value) || 2))
                }
                className="w-24"
              />
            </div>
            <Button
              size="lg"
              onClick={handleGroups}
              disabled={items.length < 2 || spinning}
              className="gap-2"
            >
              <span className={spinning ? "spin-anim inline-block" : "inline-block"}>
                🎲
              </span>
              Split!
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="yesno" className="space-y-4 mt-4">
          <div className="text-center space-y-4 py-4">
            <p className="text-muted-foreground">
              Ask the universe a yes or no question...
            </p>
            <Button
              size="lg"
              onClick={handleYesNo}
              disabled={spinning}
              className="px-12 text-lg gap-2"
            >
              <span className={spinning ? "spin-anim inline-block" : "inline-block"}>
                🎱
              </span>
              Decide!
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Lists */}
      {activeTab !== "yesno" && (
        <div className="rounded-lg border bg-card p-4 space-y-2">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Quick Lists
          </p>
          <div className="flex flex-wrap gap-2">
            {QUICK_LISTS.map((ql) => (
              <Button
                key={ql.label}
                variant="outline"
                size="sm"
                onClick={() => setRawInput(ql.items.join("\n"))}
              >
                {ql.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div
          className={`rounded-lg border-2 border-primary bg-card p-5 space-y-3 ${
            celebrating ? "celebrate-anim" : ""
          }`}
        >
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Result
          </p>

          {result.type === "yesno" && (
            <div className="text-center">
              <p
                className={`text-6xl font-black tracking-tight ${
                  result.answer === "Yes"
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {result.answer === "Yes" ? "✅ Yes!" : "❌ No!"}
              </p>
            </div>
          )}

          {result.type === "pick" && (
            <div className="flex flex-wrap gap-2">
              {result.items.map((item, i) => (
                <Badge
                  key={i}
                  className="text-base px-3 py-1 bg-primary text-primary-foreground"
                >
                  {item}
                </Badge>
              ))}
            </div>
          )}

          {result.type === "shuffle" && (
            <div className="flex flex-wrap gap-1.5">
              {result.items.map((item, i) => (
                <div key={i} className="flex items-center gap-1">
                  <Badge variant="outline" className="text-sm">
                    <span className="text-muted-foreground text-xs mr-1">
                      {i + 1}.
                    </span>
                    {item}
                  </Badge>
                </div>
              ))}
            </div>
          )}

          {result.type === "groups" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {result.groups.map((group, gi) => (
                <div key={gi} className="rounded-md bg-muted p-3 space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    Group {gi + 1}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {group.map((item, ii) => (
                      <Badge key={ii} variant="secondary" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            History (last {history.length})
          </p>
          <div className="space-y-2">
            {history.map((entry, i) => (
              <div
                key={entry.timestamp}
                className="text-sm rounded-md bg-muted px-3 py-2 flex items-start justify-between gap-2"
              >
                <div className="space-y-0.5">
                  <span className="text-xs uppercase font-medium text-muted-foreground">
                    {entry.mode === "pick"
                      ? "Pick"
                      : entry.mode === "shuffle"
                      ? "Shuffle"
                      : entry.mode === "groups"
                      ? "Groups"
                      : "Yes/No"}
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {entry.mode === "yesno" ? (
                      <Badge
                        className={
                          entry.result === "Yes"
                            ? "bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-300"
                            : "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300"
                        }
                      >
                        {entry.result as string}
                      </Badge>
                    ) : entry.mode === "pick" ? (
                      (entry.result as string[]).slice(0, 5).map((r, ri) => (
                        <Badge key={ri} variant="secondary" className="text-xs">
                          {r}
                        </Badge>
                      ))
                    ) : entry.mode === "shuffle" ? (
                      <span className="text-xs text-muted-foreground">
                        {(entry.result as string[]).slice(0, 4).join(", ")}
                        {(entry.result as string[]).length > 4 ? "..." : ""}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {(entry.result as string[][]).length} groups
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SharedInput({
  rawInput,
  setRawInput,
  items,
}: {
  rawInput: string;
  setRawInput: (v: string) => void;
  items: string[];
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm">Items list</Label>
        {items.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {items.length} item{items.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>
      <textarea
        value={rawInput}
        onChange={(e) => setRawInput(e.target.value)}
        placeholder={"One item per line, or comma-separated:\nApple\nBanana\nCherry\n\nor: Apple, Banana, Cherry"}
        className="w-full h-36 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
      />
    </div>
  );
}
