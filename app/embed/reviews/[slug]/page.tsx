import { headers } from "next/headers";
import { StarRating } from "@/components/StarRating";
import { formatDateUTC } from "@/lib/date";
import { EmbedResizer } from "@/components/EmbedResizer";

async function getData(slug: string) {
  const hdrs = await headers();
  const host = hdrs.get("x-forwarded-host") || hdrs.get("host") || "localhost:3000";
  const proto = hdrs.get("x-forwarded-proto") || "http";
  const base = `${proto}://${host}`;
  const res = await fetch(`${base}/api/listings/${encodeURIComponent(slug)}`, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error("Failed to load listing");
  return res.json();
}

export default async function EmbeddedReviews({ params, searchParams }: { params: { slug: string }, searchParams: { limit?: string } }) {
  const slug = decodeURIComponent(params.slug);
  const data = await getData(slug);
  type ApprovedReview = {
    id: string;
    source: string;
    channel: string | null;
    type: string | null;
    rating: number | null;
    text: string | null;
    authorName: string | null;
    submittedAt: string | null;
    pinned: boolean;
  };
  const reviewsAll: ApprovedReview[] = (data?.result?.reviews ?? []) as ApprovedReview[];
  const limit = Math.max(0, Math.min(24, Number(searchParams?.limit ?? 0))) || undefined;
  const reviews = limit ? reviewsAll.slice(0, limit) : reviewsAll;
  const hasGoogle = reviews.some((r) => r.source === "google");

  return (
    <div className="w-full bg-transparent text-text-primary">
      {/* auto-resize to content for iframe embedding */}
      <EmbedResizer />
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="rounded-xl border border-divider bg-surface p-4 text-sm text-text-secondary">No approved reviews yet.</div>
        ) : (
          reviews.map((r) => (
            <article key={r.id} className="rounded-xl border border-divider bg-surface p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <StarRating value={r.rating ?? null} />
                  <time className="text-xs text-text-secondary">{formatDateUTC(r.submittedAt)}</time>
                  {r.pinned && (
                    <span className="ml-1 inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-medium text-yellow-800 border border-yellow-300">Pinned</span>
                  )}
                </div>
                <div className="text-[11px] text-text-secondary">{r.source}{r.channel ? ` / ${r.channel}` : ""}</div>
              </div>
              {r.text && <p className="mt-2 text-sm leading-6">{r.text}</p>}
              {r.authorName && <div className="mt-1 text-xs text-text-secondary">— {r.authorName}</div>}
            </article>
          ))
        )}
      </div>
      {hasGoogle && (
        <div className="mt-2 text-[10px] text-text-secondary">Some reviews provided by Google.</div>
      )}
    </div>
  );
}
