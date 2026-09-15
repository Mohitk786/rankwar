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

export function formatUtcDateLabel(dateStr: string) {
  return new Date(`${dateStr}T00:00:00.000Z`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function minutesAgo(minutes: number): Date {
  return new Date(Date.now() - minutes * 60_000);
}
