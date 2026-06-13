import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url;
  return [
    { url: base, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/contact`, changeFrequency: "yearly", priority: 0.6 },
  ];
}
