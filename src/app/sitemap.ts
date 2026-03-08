import type { MetadataRoute } from "next";
import { tools } from "@/lib/tools";

const BASE = "https://quickutil.io";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE,         lastModified: new Date(), changeFrequency: "weekly",  priority: 1 },
    { url: `${BASE}/tools`, lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
  ];

  const toolRoutes: MetadataRoute.Sitemap = tools.map((t) => ({
    url:             `${BASE}/tools/${t.slug}`,
    lastModified:    new Date(),
    changeFrequency: "monthly",
    priority:        0.8,
  }));

  return [...staticRoutes, ...toolRoutes];
}
