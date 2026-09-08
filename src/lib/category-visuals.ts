import type { CSSProperties } from "react";
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

// A fixed hue per category (not theme-dependent) so category tags stay
// colorful and quickly scannable in both light and dark mode — used at low
// alpha for the tag background and full saturation for the icon/text.
type CategoryVisual = { icon: LucideIcon; hue: number };

const VISUALS: Record<string, CategoryVisual> = {
  "ai-agents-infrastructure": { icon: Bot, hue: 265 },
  "seo-ai-visibility": { icon: Search, hue: 199 },
  "marketing-advertising": { icon: Megaphone, hue: 330 },
  "crypto-web3": { icon: Bitcoin, hue: 38 },
  "developer-tools": { icon: Code2, hue: 221 },
  "business-finance-legal": { icon: Briefcase, hue: 25 },
  "security-privacy-compliance": { icon: ShieldCheck, hue: 210 },
  "health-fitness-wellness": { icon: HeartPulse, hue: 350 },
  "social-media-creator-tools": { icon: Share2, hue: 285 },
  "leaderboards-attention": { icon: Trophy, hue: 45 },
  "hiring-jobs-careers": { icon: UserSearch, hue: 165 },
  "education-learning": { icon: GraduationCap, hue: 255 },
  "agencies-studios-services": { icon: Building2, hue: 15 },
  "ecommerce-retail": { icon: ShoppingCart, hue: 145 },
  "domains-web-assets": { icon: Globe, hue: 185 },
  "games-entertainment": { icon: Gamepad2, hue: 310 },
  "people-profiles": { icon: UserCircle, hue: 230 },
  "productivity-personal-tools": { icon: ListChecks, hue: 155 },
  "design-creative": { icon: Palette, hue: 300 },
  other: { icon: Sparkles, hue: 0 },
};

const FALLBACK: CategoryVisual = { icon: Sparkles, hue: 0 };

export function getCategoryVisual(slug: string): CategoryVisual {
  return VISUALS[slug] ?? FALLBACK;
}

export function categoryTagStyle(slug: string): CSSProperties {
  const { hue } = getCategoryVisual(slug);
  return {
    color: `hsl(${hue} 75% 42%)`,
    backgroundColor: `hsl(${hue} 85% 50% / 0.12)`,
  };
}
