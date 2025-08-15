import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fetchHostawayReviews } from "@/lib/hostaway-reviews";
import { prisma } from "@/lib/db";

const Q = z.object({
  listingMapId: z.coerce.number().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  limit: z.coerce.number().default(50),
  offset: z.coerce.number().default(0),
  approved: z.coerce.boolean().optional(),
  pinned: z.coerce.boolean().optional(),
  ratingMin: z.coerce.number().optional(),
  ratingMax: z.coerce.number().optional(),
  channel: z.string().optional(),
  type: z.string().optional(),
  sort: z.string().optional(), // date_desc | date_asc | rating_desc | rating_asc | channel_az | channel_za
  categoryName: z.string().optional(),
  categoryMin: z.coerce.number().optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const parsed = Q.parse(Object.fromEntries(searchParams));

  // Fetch normalized Hostaway reviews (with mock fallback)
  const { items: normalized } = await fetchHostawayReviews({
    listingMapId: parsed.listingMapId,
    from: parsed.from,
    to: parsed.to,
    limit: 1000,
    offset: 0,
  });

  // Merge approval/pin state from DB
  const ids = normalized.map((i) => i.id as string);
  type Approval = { id: string; approved: boolean; pinned: boolean };
  const approvals: Approval[] = ids.length
    ? await prisma.review.findMany({ where: { id: { in: ids } }, select: { id: true, approved: true, pinned: true } })
    : [];
  const map = new Map<string, Approval>(approvals.map((a) => [a.id, a] as const));
  let items = normalized.map((i) => ({
    ...i,
    approved: map.get(i.id)?.approved ?? false,
    pinned: map.get(i.id)?.pinned ?? false,
  }));

  // Filters
  if (parsed.channel) items = items.filter((r) => (r.channel ?? "") === parsed.channel);
  if (parsed.type) items = items.filter((r) => (r.type ?? "") === parsed.type);
  if (parsed.approved !== undefined) items = items.filter((r) => Boolean(r.approved) === parsed.approved);
  if (parsed.pinned !== undefined) items = items.filter((r) => Boolean(r.pinned) === parsed.pinned);
  if (parsed.ratingMin !== undefined) items = items.filter((r) => (r.rating ?? -Infinity) >= parsed.ratingMin!);
  if (parsed.ratingMax !== undefined) items = items.filter((r) => (r.rating ?? Infinity) <= parsed.ratingMax!);
  if (parsed.categoryName) {
    const cat = parsed.categoryName;
    const min = parsed.categoryMin;
    items = items.filter((r) => {
      const v = (r as any).categories ? (r as any).categories[cat] : undefined;
      if (typeof v !== "number") return false;
      return min === undefined ? true : v >= min;
    });
  }

  // Sorting
  const sort = parsed.sort ?? "date_desc";
  items = items.sort((a: any, b: any) => {
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

  const count = items.length;
  const window = items.slice(parsed.offset, parsed.offset + parsed.limit);

  return NextResponse.json({ 
    status: "success", 
    count, 
    result: {
      items: window,
      total: count
    }
  });
}
