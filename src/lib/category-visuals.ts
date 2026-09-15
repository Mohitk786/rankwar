import {
  Bot,
  Search,
  Megaphone,
  Bitcoin,
  Code2,
  Briefcase,
  ShieldCheck,
  HeartPulse,
  Share2,
  Trophy,
  UserSearch,
  GraduationCap,
  Building2,
  ShoppingCart,
  Globe,
  Gamepad2,
  UserCircle,
  ListChecks,
  Palette,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

type CategoryVisual = { icon: LucideIcon; short: string };

const VISUALS: Record<string, CategoryVisual> = {
  "ai-agents-infrastructure": { icon: Bot, short: "Agents" },
  "seo-ai-visibility": { icon: Search, short: "SEO" },
  "marketing-advertising": { icon: Megaphone, short: "Marketing" },
  "crypto-web3": { icon: Bitcoin, short: "Crypto" },
  "developer-tools": { icon: Code2, short: "Developer" },
  "business-finance-legal": { icon: Briefcase, short: "Business" },
  "security-privacy-compliance": { icon: ShieldCheck, short: "Security" },
  "health-fitness-wellness": { icon: HeartPulse, short: "Health" },
  "social-media-creator-tools": { icon: Share2, short: "Social" },
  "leaderboards-attention": { icon: Trophy, short: "Leaderboards" },
  "hiring-jobs-careers": { icon: UserSearch, short: "Hiring" },
  "education-learning": { icon: GraduationCap, short: "Education" },
  "agencies-studios-services": { icon: Building2, short: "Agencies" },
  "ecommerce-retail": { icon: ShoppingCart, short: "Ecommerce" },
  "domains-web-assets": { icon: Globe, short: "Domains" },
  "games-entertainment": { icon: Gamepad2, short: "Games" },
  "people-profiles": { icon: UserCircle, short: "People" },
  "productivity-personal-tools": { icon: ListChecks, short: "Productivity" },
  "design-creative": { icon: Palette, short: "Design" },
  other: { icon: Sparkles, short: "Other" },
};

const FALLBACK: CategoryVisual = { icon: Sparkles, short: "Other" };

export function getCategoryVisual(slug: string): CategoryVisual {
  return VISUALS[slug] ?? FALLBACK;
}

export function getCategoryShortName(slug: string, fallbackName?: string): string {
  return getCategoryVisual(slug).short || fallbackName || slug;
}
