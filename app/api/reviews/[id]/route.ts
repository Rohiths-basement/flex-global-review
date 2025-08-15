import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const Body = z.object({
  approved: z.boolean().optional(),
  pinned: z.boolean().optional(),
  listingId: z.string().optional(),
  listingSlug: z.string().optional(),
  // Optional metadata fields that dashboard may include to persist context
  source: z.string().optional(),
  channel: z.string().optional(),
  type: z.string().optional(),
  rating: z.number().nullable().optional(),
  ratingRaw: z.number().nullable().optional(),
  categories: z.any().optional(),
  text: z.string().optional(),
  languageCode: z.string().optional(),
  authorName: z.string().optional(),
  submittedAt: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = decodeURIComponent(params.id);
  const body = Body.parse(await req.json());

  let listingId = body.listingId ?? undefined;
  if (!listingId && body.listingSlug) {
    const listing = await prisma.listing.findUnique({ where: { slug: body.listingSlug } });
    listingId = listing?.id;
  }

  const data: Record<string, unknown> = {};
  if (body.approved !== undefined) data.approved = body.approved;
  if (body.pinned !== undefined) data.pinned = body.pinned;
  if (listingId) data.listingId = listingId;
  if (body.source) data.source = body.source;
  if (body.channel !== undefined) data.channel = body.channel;
  if (body.type !== undefined) data.type = body.type;
  if (body.rating !== undefined) data.rating = body.rating;
  if (body.ratingRaw !== undefined) data.ratingRaw = body.ratingRaw;
  if (body.categories !== undefined) data.categories = body.categories;
  if (body.text !== undefined) data.text = body.text;
  if (body.languageCode !== undefined) data.languageCode = body.languageCode;
  if (body.authorName !== undefined) data.authorName = body.authorName;
  if (body.submittedAt !== undefined) data.submittedAt = body.submittedAt ? new Date(body.submittedAt) : null;

  const saved = await prisma.review.upsert({
    where: { id },
    update: data,
    create: { id, source: body.source ?? "unknown", ...data },
  });

  return NextResponse.json({ status: "success", result: saved });
}
