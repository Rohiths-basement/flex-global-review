import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { fetchGoogleReviews } from "@/lib/google-places";

const Q = z.object({
  placeId: z.string().optional(),
  listingSlug: z.string().optional(),
  approved: z.coerce.boolean().optional(),
  pinned: z.coerce.boolean().optional(),
  ratingMin: z.coerce.number().optional(),
  ratingMax: z.coerce.number().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  limit: z.coerce.number().default(50),
  offset: z.coerce.number().default(0),
  sort: z.string().optional(), // date_desc | date_asc | rating_desc | rating_asc | channel_az | channel_za
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const parsed = Q.parse(Object.fromEntries(searchParams));

  let placeId = parsed.placeId;
  if (!placeId && parsed.listingSlug) {
    const listing = await prisma.listing.findUnique({ where: { slug: parsed.listingSlug } });
    if (!listing?.googlePlaceId) {
      return NextResponse.json(
        { status: "error", message: "No googlePlaceId for listing" },
        { status: 400 },
      );
    }
    placeId = listing.googlePlaceId;
  }

  if (!placeId) {
    return NextResponse.json(
      { status: "error", message: "Missing placeId or listingSlug" },
      { status: 400 },
    );
  }

  const { place, items } = await fetchGoogleReviews(placeId);
  const ids = items.map((i) => i.id as string);
  type Approval = { id: string; approved: boolean; pinned: boolean };
  const approvals: Approval[] = ids.length
    ? await prisma.review.findMany({
        where: { id: { in: ids } },
        select: { id: true, approved: true, pinned: true },
      })
    : [];
  const map = new Map<string, Approval>(approvals.map((a) => [a.id, a] as const));
  let merged = items.map((i) => ({
    ...i,
    approved: map.get(i.id)?.approved ?? false,
    pinned: map.get(i.id)?.pinned ?? false,
  }));

  // Apply filters
  if (parsed.approved !== undefined) merged = merged.filter((r) => Boolean(r.approved) === parsed.approved);
  if (parsed.pinned !== undefined) merged = merged.filter((r) => Boolean(r.pinned) === parsed.pinned);
  if (parsed.ratingMin !== undefined) merged = merged.filter((r) => (r.rating ?? -Infinity) >= parsed.ratingMin!);
  if (parsed.ratingMax !== undefined) merged = merged.filter((r) => (r.rating ?? Infinity) <= parsed.ratingMax!);
  if (parsed.from) merged = merged.filter((r) => (r.submittedAt ? r.submittedAt >= parsed.from! : true));
  if (parsed.to) merged = merged.filter((r) => (r.submittedAt ? r.submittedAt <= parsed.to! : true));

  // Sorting
  type Item = {
    submittedAt?: string | null;
    rating?: number | null;
    channel?: string | null;
  };
  const sort = parsed.sort ?? "date_desc";
  merged = merged.sort((a: Item, b: Item) => {
    switch (sort) {
      case "date_asc": {
        const da = a.submittedAt ?? "";
        const db = b.submittedAt ?? "";
        return da.localeCompare(db);
      }
      case "rating_desc": {
        const ra = a.rating ?? -Infinity;
        const rb = b.rating ?? -Infinity;
        return rb - ra;
      }
      case "rating_asc": {
        const ra = a.rating ?? Infinity;
        const rb = b.rating ?? Infinity;
        return ra - rb;
      }
      case "channel_az":
        return (a.channel ?? "").localeCompare(b.channel ?? "");
      case "channel_za":
        return (b.channel ?? "").localeCompare(a.channel ?? "");
      case "date_desc":
      default: {
        const da = a.submittedAt ?? "";
        const db = b.submittedAt ?? "";
        return db.localeCompare(da);
      }
    }
  });

  const count = merged.length;
  const window = merged.slice(parsed.offset, parsed.offset + parsed.limit);

  return NextResponse.json({
    status: "success",
    count,
    result: {
      items: window,
      total: count
    },
    place,
    attribution: { provider: "Google", logo: true },
  });
}
