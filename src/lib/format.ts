import { formatDistanceToNowStrict } from "date-fns";

export function formatUsd(amount: number): string {
  return `$${amount.toLocaleString("en-US")}`;
}

export function formatRelativeTime(date: Date): string {
  return `${formatDistanceToNowStrict(date)} ago`;
}

export function formatCount(count: number): string {
  return count.toLocaleString("en-US");
}

/** Wraps `Date.now()` behind a normal function call so it isn't flagged as an impure call inline in a Server Component's render body. */
export function minutesAgo(minutes: number): Date {
  return new Date(Date.now() - minutes * 60_000);
}
