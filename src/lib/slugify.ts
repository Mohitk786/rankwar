import type { Prisma, PrismaClient } from "@prisma/client";
import { db } from "./db";

export function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .replace(/^@/, "")
    .replace(/^https?:\/\//, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "listing";
}

type DbClient = PrismaClient | Prisma.TransactionClient;

/** Appends -2, -3, ... until the slug is free. Pass the active `tx` when called inside a transaction. */
export async function uniqueSlugFor(displayName: string, client: DbClient = db): Promise<string> {
  const base = slugify(displayName);
  let candidate = base;
  let suffix = 2;
  while (await client.listing.findUnique({ where: { slug: candidate }, select: { id: true } })) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}
