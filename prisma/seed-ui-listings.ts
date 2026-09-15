import "dotenv/config";
import { db } from "../src/lib/db";

const COMPANIES = [
  { name: "OpenAI", url: "https://openai.com", category: "ai-agents-infrastructure", amount: 4200 },
  { name: "Anthropic", url: "https://anthropic.com", category: "ai-agents-infrastructure", amount: 3100 },
  { name: "Stripe", url: "https://stripe.com", category: "business-finance-legal", amount: 2800 },
  { name: "Vercel", url: "https://vercel.com", category: "developer-tools", amount: 2400 },
  { name: "Linear", url: "https://linear.app", category: "productivity-personal-tools", amount: 1900 },
  { name: "Figma", url: "https://figma.com", category: "design-creative", amount: 1600 },
  { name: "Notion", url: "https://notion.so", category: "productivity-personal-tools", amount: 1400 },
  { name: "Cursor", url: "https://cursor.com", category: "developer-tools", amount: 1100 },
  { name: "Perplexity", url: "https://perplexity.ai", category: "seo-ai-visibility", amount: 860 },
  { name: "Framer", url: "https://framer.com", category: "design-creative", amount: 640 },
  { name: "Resend", url: "https://resend.com", category: "developer-tools", amount: 480 },
  { name: "Coinbase", url: "https://coinbase.com", category: "crypto-web3", amount: 360 },
  { name: "Raycast", url: "https://raycast.com", category: "developer-tools", amount: 280 },
  { name: "Cal.com", url: "https://cal.com", category: "productivity-personal-tools", amount: 210 },
  { name: "Ahrefs", url: "https://ahrefs.com", category: "seo-ai-visibility", amount: 160 },
  { name: "Loom", url: "https://loom.com", category: "social-media-creator-tools", amount: 120 },
  { name: "Webflow", url: "https://webflow.com", category: "design-creative", amount: 90 },
  { name: "Gumroad", url: "https://gumroad.com", category: "ecommerce-retail", amount: 65 },
  { name: "Beehiiv", url: "https://beehiiv.com", category: "marketing-advertising", amount: 42 },
  { name: "Arc", url: "https://arc.net", category: "other", amount: 24 },
] as const;

function hostname(url: string): string {
  return new URL(url).hostname.replace(/^www\./, "");
}

function minutesAgo(minutes: number): Date {
  return new Date(Date.now() - minutes * 60_000);
}

async function main() {
  const categories = await db.category.findMany({ select: { id: true, slug: true } });
  const categoryBySlug = new Map(categories.map((c) => [c.slug, c.id]));

  let created = 0;
  let skipped = 0;

  for (const [index, company] of COMPANIES.entries()) {
    const categoryId = categoryBySlug.get(company.category);
    if (!categoryId) {
      throw new Error(`Missing category ${company.category}. Run npm run db:seed first.`);
    }

    const key = hostname(company.url);
    const slug = key.replace(/\./g, "-");
    const existing = await db.listing.findUnique({ where: { slug } });
    if (existing) {
      skipped += 1;
      continue;
    }

    const firstPaidAt = minutesAgo(60 * 24 * (index + 1));
    const lastPaidAt = index < 3 ? minutesAgo(20 + index * 15) : minutesAgo(60 * (index + 2));

    const listing = await db.listing.create({
      data: {
        type: "WEBSITE",
        normalizedKey: key,
        slug,
        destinationUrl: company.url,
        displayName: company.name,
        description: `${company.name} on the public board.`,
        faviconUrl: `/api/icon-image?url=${encodeURIComponent(company.url)}`,
        categoryId,
        currentAmount: company.amount,
        raiseCount: 0,
        firstPaidAt,
        lastPaidAt,
      },
    });

    const checkout = await db.checkout.create({
      data: {
        dodoSessionId: `ui_cs_${listing.id}`,
        dodoPaymentId: `ui_pi_${listing.id}`,
        listingType: "WEBSITE",
        targetListingKey: key,
        targetDestinationUrl: company.url,
        targetDisplayName: company.name,
        targetCategoryId: categoryId,
        targetAmount: company.amount,
        deltaAmount: company.amount,
        status: "SUCCEEDED",
        tosAgreedAt: lastPaidAt,
        createdAt: lastPaidAt,
        expiresAt: new Date(lastPaidAt.getTime() + 60 * 60 * 1000),
      },
    });

    await db.bid.create({
      data: {
        listingId: listing.id,
        amount: company.amount,
        resultingTotal: company.amount,
        checkoutId: checkout.id,
        createdAt: lastPaidAt,
      },
    });

    await db.click.createMany({
      data: Array.from({ length: 8 + index * 3 }, (_, i) => ({
        listingId: listing.id,
        visitorId: `ui-visitor-${index}-${i}`,
        ipHash: `ui-ip-${index}-${i}`,
        isCounted: true,
        createdAt: lastPaidAt,
      })),
    });

    created += 1;
  }

  console.log(`UI listings: created ${created}, skipped ${skipped}.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
