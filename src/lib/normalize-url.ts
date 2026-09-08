export class SubmissionValidationError extends Error {}

const TRACKING_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
  "msclkid",
  "ref",
  "mc_cid",
  "mc_eid",
  "igshid",
  "si",
];

// Chat/invite links are rejected outright — a listing must point at a
// product, not a group chat someone can be funneled into.
const CHAT_INVITE_HOSTS = [
  "t.me",
  "telegram.me",
  "wa.me",
  "chat.whatsapp.com",
  "discord.gg",
  "signal.group",
  "m.me",
  "messenger.com",
];

// Non-exhaustive placeholder — a real deployment should run submitted
// domains through a proper content-classification/blocklist service.
const ADULT_CONTENT_HOSTS: string[] = [];

const X_HOSTS = ["twitter.com", "x.com", "mobile.twitter.com"];

function stripWww(hostname: string): string {
  return hostname.startsWith("www.") ? hostname.slice(4) : hostname;
}

function isChatInviteHost(hostname: string): boolean {
  return CHAT_INVITE_HOSTS.some((h) => hostname === h || hostname.endsWith(`.${h}`));
}

function isAdultHost(hostname: string): boolean {
  return ADULT_CONTENT_HOSTS.some((h) => hostname === h || hostname.endsWith(`.${h}`));
}

function isDiscordInvite(hostname: string, pathname: string): boolean {
  return hostname === "discord.com" && pathname.startsWith("/invite/");
}

export type NormalizedSubmission =
  | { type: "X_HANDLE"; normalizedKey: string; destinationUrl: string; displayHint: string }
  | { type: "WEBSITE"; normalizedKey: string; destinationUrl: string; displayHint: string };

function normalizeHandle(raw: string): string {
  const handle = raw.replace(/^@/, "").trim().toLowerCase();
  if (!/^[a-z0-9_]{1,15}$/.test(handle)) {
    throw new SubmissionValidationError("That doesn't look like a valid X/Twitter handle.");
  }
  return handle;
}

export function normalizeSubmission(rawInput: string): NormalizedSubmission {
  const input = rawInput.trim();
  if (!input) throw new SubmissionValidationError("Enter a URL or @handle.");

  if (input.startsWith("@")) {
    const handle = normalizeHandle(input);
    return {
      type: "X_HANDLE",
      normalizedKey: `@${handle}`,
      destinationUrl: `https://x.com/${handle}`,
      displayHint: `@${handle}`,
    };
  }

  let url: URL;
  try {
    url = new URL(input.includes("://") ? input : `https://${input}`);
  } catch {
    throw new SubmissionValidationError("Enter a valid URL, like example.com or https://example.com/product.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new SubmissionValidationError("Only http/https URLs are supported.");
  }

  const hostname = stripWww(url.hostname.toLowerCase());

  if (X_HOSTS.includes(hostname)) {
    const handle = url.pathname.split("/").filter(Boolean)[0];
    if (!handle) throw new SubmissionValidationError("Couldn't find a handle in that X/Twitter URL.");
    const normalized = normalizeHandle(handle);
    return {
      type: "X_HANDLE",
      normalizedKey: `@${normalized}`,
      destinationUrl: `https://x.com/${normalized}`,
      displayHint: `@${normalized}`,
    };
  }

  if (!hostname.includes(".")) {
    throw new SubmissionValidationError("Enter a valid URL.");
  }

  if (isChatInviteHost(hostname) || isDiscordInvite(hostname, url.pathname)) {
    throw new SubmissionValidationError(
      "Chat/invite links (Telegram, WhatsApp, Discord, Signal, Messenger) aren't accepted — link to your product itself."
    );
  }

  if (isAdultHost(hostname)) {
    throw new SubmissionValidationError("Adult content isn't accepted on this board.");
  }

  // Path-keyed platforms: the sub-app/repo, not the bare domain, is what
  // should be unique, so github.com/org/repoA must not collide with
  // github.com/org/repoB.
  if (hostname === "github.com") {
    const segments = url.pathname.split("/").filter(Boolean).slice(0, 2);
    if (segments.length < 2) {
      throw new SubmissionValidationError("Link to a specific GitHub repo (github.com/org/repo).");
    }
    const path = segments.join("/");
    return {
      type: "WEBSITE",
      normalizedKey: `github.com/${path}`,
      destinationUrl: `https://github.com/${path}`,
      displayHint: path,
    };
  }

  if (hostname === "play.google.com") {
    const appId = url.searchParams.get("id");
    if (!appId) throw new SubmissionValidationError("Link to a specific Play Store listing.");
    return {
      type: "WEBSITE",
      normalizedKey: `play.google.com/${appId}`,
      destinationUrl: `https://play.google.com/store/apps/details?id=${appId}`,
      displayHint: appId,
    };
  }

  if (hostname === "apps.apple.com") {
    const segments = url.pathname.split("/").filter(Boolean);
    const idSegment = segments.find((s) => /^id\d+$/.test(s));
    if (!idSegment) throw new SubmissionValidationError("Link to a specific App Store listing.");
    return {
      type: "WEBSITE",
      normalizedKey: `apps.apple.com/${idSegment}`,
      destinationUrl: `https://apps.apple.com/app/${idSegment}`,
      displayHint: idSegment,
    };
  }

  // Generic website: strip tracking params, fragment, and trailing slash.
  for (const param of TRACKING_PARAMS) url.searchParams.delete(param);
  const search = url.searchParams.toString();
  let pathname = url.pathname.replace(/\/+$/, "");
  if (pathname === "") pathname = "";

  const key = `${hostname}${pathname}${search ? `?${search}` : ""}`;
  const destinationUrl = `https://${hostname}${pathname}${search ? `?${search}` : ""}`;

  return {
    type: "WEBSITE",
    normalizedKey: key,
    destinationUrl,
    displayHint: hostname,
  };
}
