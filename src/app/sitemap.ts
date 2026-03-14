import type { MetadataRoute } from "next";
import { tools } from "@/lib/tools";
import { conversionPairs } from "@/data/conversions";
import { colorConversionPairs } from "@/data/colorConversions";
import { mcpServers } from "@/data/mcpServers";
import { mcpCategoryDefs } from "@/data/mcpCategories";
import { mcpLearnTopics } from "@/data/mcpLearnTopics";
import { mcpUseCases } from "@/data/mcpUseCases";

const BASE = "https://quickutil.io";

// High-volume conversion pairs get elevated priority
const HIGH_PRIORITY_CONVERSIONS = new Set([
  "kg-to-lb", "lb-to-kg", "kg-to-g", "g-to-kg",
  "cm-to-in", "in-to-cm", "m-to-ft", "ft-to-m", "km-to-mi", "mi-to-km",
  "c-to-f", "f-to-c", "c-to-k",
  "mb-to-gb", "gb-to-mb", "kb-to-mb", "gb-to-tb",
  "km_h-to-mph", "mph-to-km_h",
  "L-to-gal", "gal-to-L",
]);

// High-volume color pairs
const HIGH_PRIORITY_COLOR = new Set([
  "rgb-to-hex", "hex-to-rgb", "hsl-to-hex", "hex-to-hsl",
  "rgb-to-hsl", "hsl-to-rgb",
]);

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE,                    lastModified: new Date(), changeFrequency: "weekly",  priority: 1   },
    { url: `${BASE}/tools`,         lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE}/convert`,       lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/color`,         lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/mcp`,           lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE}/mcp/servers`,   lastModified: new Date(), changeFrequency: "weekly",  priority: 0.85 },
    { url: `${BASE}/mcp/learn`,     lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/mcp/use-cases`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  ];

  const toolRoutes: MetadataRoute.Sitemap = tools.map((t) => ({
    url:             `${BASE}/tools/${t.slug}`,
    lastModified:    new Date(),
    changeFrequency: "monthly",
    priority:        0.8,
  }));

  const conversionRoutes: MetadataRoute.Sitemap = conversionPairs.map((p) => ({
    url:             `${BASE}/convert/${p.slug}`,
    lastModified:    new Date(),
    changeFrequency: "monthly",
    priority:        HIGH_PRIORITY_CONVERSIONS.has(p.slug) ? 0.9 : 0.7,
  }));

  const colorRoutes: MetadataRoute.Sitemap = colorConversionPairs.map((p) => ({
    url:             `${BASE}/color/${p.slug}`,
    lastModified:    new Date(),
    changeFrequency: "monthly",
    priority:        HIGH_PRIORITY_COLOR.has(p.slug) ? 0.9 : 0.75,
  }));

  const mcpServerRoutes: MetadataRoute.Sitemap = mcpServers.map((s) => ({
    url:             `${BASE}/mcp/server/${s.slug}`,
    lastModified:    new Date(s.lastUpdated),
    changeFrequency: "monthly",
    priority:        s.isOfficial ? 0.85 : 0.75,
  }));

  const mcpCategoryRoutes: MetadataRoute.Sitemap = mcpCategoryDefs.map((c) => ({
    url:             `${BASE}/mcp/category/${c.id}`,
    lastModified:    new Date(),
    changeFrequency: "monthly",
    priority:        0.75,
  }));

  const mcpLearnRoutes: MetadataRoute.Sitemap = mcpLearnTopics.map((t) => ({
    url:             `${BASE}/mcp/learn/${t.slug}`,
    lastModified:    new Date(),
    changeFrequency: "monthly",
    priority:        0.75,
  }));

  const mcpUseCaseRoutes: MetadataRoute.Sitemap = mcpUseCases.map((u) => ({
    url:             `${BASE}/mcp/use-cases/${u.slug}`,
    lastModified:    new Date(),
    changeFrequency: "monthly",
    priority:        0.75,
  }));

  return [
    ...staticRoutes,
    ...toolRoutes,
    ...conversionRoutes,
    ...colorRoutes,
    ...mcpServerRoutes,
    ...mcpCategoryRoutes,
    ...mcpLearnRoutes,
    ...mcpUseCaseRoutes,
  ];
}
