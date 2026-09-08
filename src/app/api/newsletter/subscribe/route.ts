import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit, getClientIp } from "@/lib/abuse";

const schema = z.object({
  email: z.email(),
  frequency: z.enum(["daily", "weekly"]),
  categorySlug: z.string().optional(),
});

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  if (!rateLimit(`newsletter:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }

  const { email, frequency, categorySlug } = parsed.data;
  const category = categorySlug ? await db.category.findUnique({ where: { slug: categorySlug } }) : null;

  await db.newsletterSubscriber.upsert({
    where: { email },
    create: {
      email,
      frequency,
      categoryId: category?.id ?? null,
      confirmToken: randomBytes(16).toString("hex"),
      // No transactional email provider is wired up yet — subscriptions
      // are stored confirmed immediately. Add double opt-in once a real
      // provider (Resend, Postmark, etc.) is configured to send digests.
      confirmedAt: new Date(),
    },
    update: {
      frequency,
      categoryId: category?.id ?? null,
      unsubscribedAt: null,
    },
  });

  return NextResponse.json({ ok: true });
}
