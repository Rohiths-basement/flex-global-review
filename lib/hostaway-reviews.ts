import { z } from "zod";
import { getHostawayAccessToken } from "@/lib/hostaway";

export const HostawayQuery = z.object({
  listingMapId: z.number().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  limit: z.number().default(50),
  offset: z.number().default(0),
});
export type HostawayQuery = z.infer<typeof HostawayQuery>;

export type HostawayReview = {
  id: number;
  type: "guest-to-host" | "host-to-guest";
  status: string;
  rating: number | null;
  reviewCategory?: { category: string; rating: number }[];
  submittedAt?: string;
  guestName?: string;
  listingName?: string;
  channelId?: number;
  publicReview?: string | null;
  listingMapId?: number;
};

const CHANNEL_MAP: Record<number, string> = {
  2005: "airbnb",
  2002: "booking",
  2004: "vrbo",
};

export function normalizeHostaway(r: HostawayReview) {
  const categories = Object.fromEntries((r.reviewCategory ?? []).map((c) => [c.category, c.rating]));
  const avg10 =
    r.rating ??
    ((r.reviewCategory && r.reviewCategory.length)
      ? r.reviewCategory.reduce((s, c) => s + c.rating, 0) / r.reviewCategory.length
      : null);
  const rating = avg10 == null ? null : Math.round((avg10 / 2) * 10) / 10; // 0–5, 0.1 steps

  return {
    id: `hostaway:${r.id}`,
    listing: { listingMapId: r.listingMapId, name: r.listingName ?? "Unknown" },
    channel: r.channelId ? CHANNEL_MAP[r.channelId] ?? "hostaway" : "hostaway",
    type: r.type,
    text: r.publicReview ?? undefined,
    rating,
    ratingRaw: avg10,
    categories,
    submittedAt: r.submittedAt ? new Date(r.submittedAt.replace(" ", "T") + "Z").toISOString() : null,
    authorName: r.guestName ?? null,
    approved: false,
    source: "hostaway",
  };
}

async function fetchFromHostawayAPI(q: HostawayQuery) {
  const token = await getHostawayAccessToken();
  const params = new URLSearchParams();
  if (q.listingMapId) params.set("listingMapId", String(q.listingMapId));
  if (q.from) params.set("departureDateStart", q.from);
  if (q.to) params.set("departureDateEnd", q.to);
  params.set("limit", String(q.limit));
  params.set("offset", String(q.offset));

  const url = `https://api.hostaway.com/v1/reviews?${params.toString()}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 60 * 60 },
  });
  if (!res.ok) throw new Error(`Hostaway reviews failed ${res.status}`);
  const data = await res.json();
  const items: HostawayReview[] = data?.result ?? [];
  return items;
}

async function fetchFromMock(): Promise<HostawayReview[]> {
  const mod = await import("@/data/hostaway-mock.json");
  return (mod.default ?? mod) as HostawayReview[];
}

export async function fetchHostawayReviews(q: HostawayQuery) {
  let items: HostawayReview[] = [];
  try {
    items = await fetchFromHostawayAPI(q);
  } catch {
    // swallow to allow mock fallback
  }
  if (!items || items.length === 0) {
    items = await fetchFromMock();
  }

  // Optional filter/paginate on mock if needed
  let filtered = items;
  if (q.listingMapId) filtered = filtered.filter((r) => r.listingMapId === q.listingMapId);
  if (q.from) filtered = filtered.filter((r) => (r.submittedAt ? r.submittedAt >= q.from! : true));
  if (q.to) filtered = filtered.filter((r) => (r.submittedAt ? r.submittedAt <= q.to! : true));

  const count = filtered.length;
  const window = filtered.slice(q.offset, q.offset + q.limit);
  const normalized = window.map(normalizeHostaway);
  return { count, items: normalized };
}
