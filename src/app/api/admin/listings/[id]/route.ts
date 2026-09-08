import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-auth";

const patchSchema = z.object({
  status: z.enum(["ACTIVE", "UNDER_REVIEW", "REMOVED"]).optional(),
  categorySlug: z.string().optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid body." }, { status: 400 });

  const data: { status?: "ACTIVE" | "UNDER_REVIEW" | "REMOVED"; categoryId?: string } = {};
  if (parsed.data.status) data.status = parsed.data.status;
  if (parsed.data.categorySlug) {
    const category = await db.category.findUnique({ where: { slug: parsed.data.categorySlug } });
    if (!category) return NextResponse.json({ error: "Unknown category." }, { status: 400 });
    data.categoryId = category.id;
  }

  const listing = await db.listing.update({ where: { id }, data }).catch(() => null);
  if (!listing) return NextResponse.json({ error: "Listing not found." }, { status: 404 });

  return NextResponse.json({ ok: true, listing });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  // Soft-remove: keeps the Bid/Click history intact for the payment audit
  // trail while taking the listing off every public board.
  const listing = await db.listing.update({ where: { id }, data: { status: "REMOVED" } }).catch(() => null);
  if (!listing) return NextResponse.json({ error: "Listing not found." }, { status: 404 });

  return NextResponse.json({ ok: true });
}
