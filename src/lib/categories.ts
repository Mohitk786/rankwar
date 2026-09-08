export type CategorySeed = {
  slug: string;
  name: string;
  description: string;
  keywords: string[];
};

export const CATEGORIES: CategorySeed[] = [
  {
    slug: "ai-agents-infrastructure",
    name: "AI Agents & Infrastructure",
    description: "Agent frameworks, LLM tooling, inference infrastructure.",
    keywords: ["agent", "llm", "ai infra", "inference", "rag", "vector", "prompt", "model"],
  },
  {
    slug: "seo-ai-visibility",
    name: "SEO & AI Visibility",
    description: "Search ranking, AI-search visibility, and content discovery tools.",
    keywords: ["seo", "search visibility", "backlink", "serp", "aeo", "geo", "answer engine"],
  },
  {
    slug: "marketing-advertising",
    name: "Marketing & Advertising",
    description: "Growth, ads, campaigns, and marketing automation.",
    keywords: ["marketing", "ads", "advertising", "campaign", "growth", "email marketing"],
  },
  {
    slug: "crypto-web3",
    name: "Crypto, Web3 & Investing",
    description: "Crypto, blockchain, DeFi, and investing products.",
    keywords: ["crypto", "web3", "blockchain", "token", "defi", "nft", "wallet", "trading"],
  },
  {
    slug: "developer-tools",
    name: "Developer Tools",
    description: "SDKs, APIs, dev workflow, and infrastructure tooling.",
    keywords: ["api", "sdk", "developer", "cli", "devops", "database", "framework", "open source"],
  },
  {
    slug: "business-finance-legal",
    name: "Business, Finance & Legal",
    description: "B2B software, accounting, finance, and legal tools.",
    keywords: ["finance", "accounting", "invoice", "legal", "contract", "tax", "payroll"],
  },
  {
    slug: "security-privacy-compliance",
    name: "Security, Privacy & Compliance",
    description: "Security tooling, privacy software, and compliance automation.",
    keywords: ["security", "privacy", "compliance", "soc2", "gdpr", "encryption", "auth"],
  },
  {
    slug: "health-fitness-wellness",
    name: "Health, Fitness & Wellness",
    description: "Health, fitness, mental wellness, and medical products.",
    keywords: ["health", "fitness", "wellness", "workout", "nutrition", "therapy", "medical"],
  },
  {
    slug: "social-media-creator-tools",
    name: "Social Media & Creator Tools",
    description: "Social schedulers, creator monetization, and content tools.",
    keywords: ["social media", "creator", "influencer", "content calendar", "tiktok", "instagram"],
  },
  {
    slug: "leaderboards-attention",
    name: "Leaderboards & Attention Markets",
    description: "Other pay-to-rank boards, directories, and attention markets.",
    keywords: ["leaderboard", "directory", "ranking", "attention", "listing site"],
  },
  {
    slug: "hiring-jobs-careers",
    name: "Hiring, Jobs & Careers",
    description: "Job boards, recruiting, and career tools.",
    keywords: ["hiring", "jobs", "careers", "recruiting", "ats", "resume", "talent"],
  },
  {
    slug: "education-learning",
    name: "Education & Learning",
    description: "Courses, tutoring, and learning platforms.",
    keywords: ["education", "learning", "course", "tutor", "school", "study"],
  },
  {
    slug: "agencies-studios-services",
    name: "Agencies, Studios & Services",
    description: "Agencies, freelance studios, and productized services.",
    keywords: ["agency", "studio", "freelance", "service", "consulting"],
  },
  {
    slug: "ecommerce-retail",
    name: "Ecommerce & Retail",
    description: "Online stores, retail tooling, and commerce infrastructure.",
    keywords: ["ecommerce", "shopify", "retail", "store", "checkout", "inventory"],
  },
  {
    slug: "domains-web-assets",
    name: "Domains & Web Assets",
    description: "Domains, digital real estate, and web assets for sale.",
    keywords: ["domain", "web asset", "flipping", "marketplace"],
  },
  {
    slug: "games-entertainment",
    name: "Games & Entertainment",
    description: "Games, entertainment apps, and media products.",
    keywords: ["game", "gaming", "entertainment", "media", "streaming", "video"],
  },
  {
    slug: "people-profiles",
    name: "People & Profiles",
    description: "Personal brands, portfolios, and profile pages.",
    keywords: ["portfolio", "personal brand", "profile", "resume site"],
  },
  {
    slug: "productivity-personal-tools",
    name: "Productivity & Personal Tools",
    description: "Personal productivity, note-taking, and life-admin tools.",
    keywords: ["productivity", "notes", "todo", "calendar", "habit", "planner"],
  },
  {
    slug: "design-creative",
    name: "Design & Creative",
    description: "Design tools, creative assets, and visual software.",
    keywords: ["design", "creative", "figma", "illustration", "template", "graphics"],
  },
  {
    slug: "other",
    name: "Other",
    description: "Everything else.",
    keywords: [],
  },
];

export function suggestCategorySlug(text: string): string {
  const haystack = text.toLowerCase();
  let best: { slug: string; score: number } = { slug: "other", score: 0 };
  for (const category of CATEGORIES) {
    let score = 0;
    for (const keyword of category.keywords) {
      if (haystack.includes(keyword)) score += 1;
    }
    if (score > best.score) best = { slug: category.slug, score };
  }
  return best.slug;
}
