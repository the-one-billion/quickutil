import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight, Zap, Shield, Smartphone, Globe,
  FilePlus2, Minimize2, QrCode, Weight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { tools } from "@/lib/tools";
import AdSlot from "@/components/AdSlot";

export const metadata: Metadata = {
  title: "UtilityKit – 30+ Free Browser-Based Tools",
  description:
    "PDF merge, image compress, BMI calculator, QR codes and 30+ more tools — all free, all client-side. Your files never leave your browser.",
};

const featuredSlugs = ["pdf-merge", "image-compress", "qr-generator", "bmi-calculator"];
const featuredTools = tools.filter((t) => featuredSlugs.includes(t.slug));

const features = [
  {
    icon: Shield,
    title: "100% Private",
    desc: "Every tool runs entirely in your browser. Your files are never uploaded to any server.",
  },
  {
    icon: Zap,
    title: "Blazing Fast",
    desc: "No round-trips. Processing happens instantly on your device using browser-native APIs.",
  },
  {
    icon: Smartphone,
    title: "Mobile-Ready",
    desc: "Fully responsive and PWA-enabled. Install it to your home screen for offline use.",
  },
  {
    icon: Globe,
    title: "Always Free",
    desc: "Core tools are free forever. No account required. No paywalls on essentials.",
  },
];

const iconMap: Record<string, React.ElementType> = {
  FilePlus2, Minimize2, QrCode, Weight,
};

export default function HomePage() {
  return (
    <>
      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background pb-16 pt-20 text-center">
        {/* Subtle grid background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, hsl(var(--border)) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative mx-auto max-w-3xl px-4">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Zap className="h-3.5 w-3.5" />
            30+ Free Tools · 100% Client-Side
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            Every tool you need,{" "}
            <span className="text-primary">right in your browser</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            PDF tools, image utilities, calculators, converters and more — all
            free, all instant, all private. No uploads. No account.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/tools">
              <Button size="lg" className="gap-2">
                Browse All Tools <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/tools/pdf-merge">
              <Button size="lg" variant="outline">
                Try PDF Merge
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Ad Leaderboard ─────────────────────────────────────────────────── */}
      <div className="flex justify-center py-4">
        <AdSlot size="leaderboard" />
      </div>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="mb-10 text-center text-2xl font-bold">Why UtilityKit?</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-xl border border-border bg-card p-6 text-center hover:shadow-md transition-shadow"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-1 font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Tools ─────────────────────────────────────────────────── */}
      <section className="bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Popular Tools</h2>
            <Link href="/tools">
              <Button variant="ghost" size="sm" className="gap-1">
                All Tools <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredTools.map((tool) => {
              const Icon = iconMap[tool.icon] ?? Zap;
              return (
                <Link
                  key={tool.slug}
                  href={`/tools/${tool.slug}`}
                  className="tool-card"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">{tool.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {tool.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 text-center">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {[
            { value: "30+",  label: "Free Tools"       },
            { value: "0",    label: "Uploads Required"  },
            { value: "100%", label: "Client-Side"       },
            { value: "∞",   label: "Files Processed"   },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-4xl font-extrabold text-primary">{value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom Ad ──────────────────────────────────────────────────────── */}
      <div className="flex justify-center pb-12">
        <AdSlot size="rectangle" />
      </div>
    </>
  );
}
