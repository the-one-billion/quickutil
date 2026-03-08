import Link from "next/link";
import {
  FilePlus2, Scissors, Image, FileImage, Minimize2, Expand, Crop,
  RefreshCw, Stamp, Eraser, Weight, Landmark, Percent, CalendarDays,
  Receipt, Calculator, ArrowLeftRight, Palette, Binary, Braces,
  FileText, CaseSensitive, Diff, AlignLeft, QrCode, KeyRound,
  Hash, Pipette, Timer, ShieldCheck, Code2, Zap,
} from "lucide-react";
import { type Tool, categoryColors } from "@/lib/tools";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/badge";

// Map string icon names → Lucide components
const iconMap: Record<string, React.ElementType> = {
  FilePlus2, Scissors, Image, FileImage, Minimize2, Expand, Crop,
  RefreshCw, Stamp, Eraser, Weight, Landmark, Percent, CalendarDays,
  Receipt, Calculator, ArrowLeftRight, Palette, Binary, Braces,
  FileText, CaseSensitive, Diff, AlignLeft, QrCode, KeyRound,
  Hash, Pipette, Timer, ShieldCheck, Code2, Zap,
};

interface ToolCardProps {
  tool: Tool;
}

export default function ToolCard({ tool }: ToolCardProps) {
  const Icon = iconMap[tool.icon] ?? Zap;

  return (
    <Link href={`/tools/${tool.slug}`} className="tool-card group animate-fade-in">
      {/* Icon */}
      <div className={cn(
        "flex h-11 w-11 items-center justify-center rounded-lg",
        categoryColors[tool.category].replace("text-", "text-").split(" ").filter(c => c.startsWith("bg-")).join(" ") || "bg-primary/10"
      )}>
        <Icon className={cn(
          "h-5 w-5",
          categoryColors[tool.category].split(" ").filter(c => c.startsWith("text-")).join(" ") || "text-primary"
        )} />
      </div>

      {/* Meta */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold leading-tight group-hover:text-primary transition-colors">
          {tool.name}
        </h3>
        <div className="flex gap-1 shrink-0">
          {tool.isNew && (
            <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4">
              NEW
            </Badge>
          )}
          {tool.isPro && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
              PRO
            </Badge>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground leading-snug line-clamp-2">
        {tool.description}
      </p>

      <span className={cn(
        "mt-auto w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold",
        categoryColors[tool.category]
      )}>
        {tool.category}
      </span>
    </Link>
  );
}
