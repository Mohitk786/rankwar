import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { getDailyDates } from "@/lib/ranking";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const [categories, listings, dailyDates] = await Promise.all([
    db.category.findMany({ select: { slug: true } }),
    db.listing.findMany({ where: { status: "ACTIVE" }, select: { slug: true, updatedAt: true } }),
    getDailyDates(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "always", priority: 1 },
    { url: `${siteUrl}/today`, changeFrequency: "always", priority: 0.9 },
    { url: `${siteUrl}/categories`, changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/daily`, changeFrequency: "daily", priority: 0.7 },
    { url: `${siteUrl}/about`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${siteUrl}/rules`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/faq`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/terms`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${siteUrl}/privacy`, changeFrequency: "monthly", priority: 0.3 },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${siteUrl}/category/${c.slug}`,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  const listingPages: MetadataRoute.Sitemap = listings.map((l) => ({
    url: `${siteUrl}/product/${l.slug}`,
    lastModified: l.updatedAt,
    changeFrequency: "daily",
    priority: 0.6,
  }));

  const dailyPages: MetadataRoute.Sitemap = dailyDates.map((d) => ({
    url: `${siteUrl}/daily/${d.date}`,
    changeFrequency: "never",
    priority: 0.4,
  }));

  return [...staticPages, ...categoryPages, ...listingPages, ...dailyPages];
}
