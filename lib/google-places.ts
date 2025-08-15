import { prisma } from "@/lib/db";

export type NormalizedGoogleReview = {
  id: string;
  source: "google";
  channel: "google";
  listing: null;
  type: null;
  rating: number | null;
  ratingRaw: number | null;
  categories: null;
  text: string;
  submittedAt: string | null;
  authorName: string | null;
  sourceMeta?: {
    authorUri?: string | null;
    profilePhotoUri?: string | null;
  };
  approved: boolean;
};

type GoogleAuthorAttribution = {
  displayName?: string;
  uri?: string;
  photoUri?: string;
};

type GoogleReviewRaw = {
  rating?: number;
  text?: { text?: string } | string;
  publishTime?: string;
  authorAttribution?: GoogleAuthorAttribution;
};

type GooglePlaceRaw = {
  id: string;
  displayName?: { text?: string } | string;
  rating?: number;
  userRatingCount?: number;
  reviews?: GoogleReviewRaw[];
};

type CachePayload = {
  place: { id: string; name: string; rating: number | null; userRatingCount: number | null };
  items: NormalizedGoogleReview[];
};

export async function fetchGoogleReviews(placeId: string) {
  const key = `google:place:${placeId}`;
  // Check cache (<= 30 days TTL)
  const now = new Date();
  const cached = await prisma.reviewCache.findUnique({ where: { key } });
  if (cached && cached.expiresAt > now) {
    const { place, items } = cached.payload as CachePayload;
    return { place, items };
  }

  const fields = ["id", "displayName", "rating", "userRatingCount", "reviews"].join(",",
  );
  const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(
    placeId,
  )}?fields=${fields}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
  const res = await fetch(url, { next: { revalidate: 60 * 60 * 24 } });
  if (!res.ok) throw new Error(`Places API failed ${res.status}`);
  const place = (await res.json()) as GooglePlaceRaw;

  const items: NormalizedGoogleReview[] = (place.reviews ?? []).slice(0, 5).map((rv: GoogleReviewRaw, i: number) => ({
    id: `google:${place.id}:${rv.publishTime ?? i}`,
    source: "google",
    channel: "google",
    listing: null,
    type: null,
    rating: rv.rating ?? null,
    ratingRaw: rv.rating ?? null,
    categories: null,
    text: typeof rv.text === "string" ? rv.text : rv.text?.text ?? "",
    submittedAt: rv.publishTime ?? null,
    authorName: rv.authorAttribution?.displayName ?? null,
    sourceMeta: {
      authorUri: rv.authorAttribution?.uri ?? null,
      profilePhotoUri: rv.authorAttribution?.photoUri ?? null,
    },
    approved: false,
  }));

  const payload: CachePayload = {
    place: {
      id: place.id,
      name: typeof place.displayName === "string" ? place.displayName : place.displayName?.text ?? "",
      rating: place.rating ?? null,
      userRatingCount: place.userRatingCount ?? null,
    },
    items,
  };

  // Cache for 30 days
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await prisma.reviewCache.upsert({
    where: { key },
    create: { key, payload, expiresAt },
    update: { payload, expiresAt },
  });

  return payload;
}
