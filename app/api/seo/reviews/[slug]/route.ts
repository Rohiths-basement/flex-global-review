import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function corsHeaders(origin: string | null) {
  try {
    const host = origin ? new URL(origin).hostname : null;
    const allow = host && /theflex\.global$/.test(host) ? origin! : "*";
    return {
      "Access-Control-Allow-Origin": allow,
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    } as Record<string, string>;
  } catch {
    return {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    } as Record<string, string>;
  }
}

type JsonLdReview = {
  "@type": "Review";
  reviewBody?: string;
  datePublished?: string;
  author?: { "@type": "Person"; name: string };
  reviewRating?: { "@type": "Rating"; ratingValue: number; bestRating: number; worstRating: number };
};

type JsonLd = {
  "@context": "https://schema.org";
  "@type": "LodgingBusiness";
  name: string;
  url: string;
  aggregateRating?: { "@type": "AggregateRating"; ratingValue: number; reviewCount: number; bestRating: number; worstRating: number };
  review?: JsonLdReview[];
};

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const slug = decodeURIComponent(params.slug);
  const listing = await prisma.listing.findUnique({ where: { slug } });
  if (!listing) {
    const res = NextResponse.json({ status: "error", message: "Listing not found" }, { status: 404 });
    const h = corsHeaders(req.headers.get("origin"));
    Object.entries(h).forEach(([k, v]) => res.headers.set(k, v));
    return res;
  }

  const reviews = await prisma.review.findMany({
    where: { listingId: listing.id, approved: true },
    orderBy: [{ pinned: "desc" }, { submittedAt: "desc" }],
    take: 50,
  });

  // compute aggregate rating using normalized 0-5 rating, skipping nulls
  const rated = reviews.filter((r) => r.rating != null) as { rating: number }[];
  const ratingCount = rated.length;
  const ratingValue = ratingCount ? Math.round((rated.reduce((s, r) => s + r.rating, 0) / ratingCount) * 10) / 10 : undefined;

  const baseUrl = `https://theflex.global/properties/${encodeURIComponent(slug)}`;

  const jsonLd: JsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: listing.name ?? slug,
    url: baseUrl,
  };

  if (ratingValue != null && ratingCount > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue,
      reviewCount: ratingCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  if (reviews.length) {
    jsonLd.review = reviews.slice(0, 25).map((r) => ({
      "@type": "Review",
      reviewBody: r.text ?? undefined,
      datePublished: r.submittedAt ?? undefined,
      author: r.authorName ? { "@type": "Person", name: r.authorName } : undefined,
      reviewRating: r.rating != null ? { "@type": "Rating", ratingValue: r.rating, bestRating: 5, worstRating: 1 } : undefined,
    }));
  }

  const res = new NextResponse(JSON.stringify(jsonLd), {
    status: 200,
    headers: { "Content-Type": "application/ld+json; charset=utf-8", "Cache-Control": "public, max-age=300" },
  });
  const h = corsHeaders(req.headers.get("origin"));
  Object.entries(h).forEach(([k, v]) => res.headers.set(k, v));
  return res;
}

export async function OPTIONS(req: NextRequest) {
  const headers = corsHeaders(req.headers.get("origin"));
  return new NextResponse(null, { status: 204, headers });
}
