import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function corsHeaders(origin: string | null) {
  const allowOrigin = origin && /theflex\.global$/.test(new URL(origin).hostname) ? origin : "*";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, OPTIONS, PATCH, DELETE",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  } as Record<string, string>;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = decodeURIComponent(resolvedParams.slug);
  
  try {
    const listing = await prisma.listing.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        hostawayMapId: true,
        googlePlaceId: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!listing) {
      return NextResponse.json(
        { status: "error", error: "Listing not found" },
        { status: 404 }
      );
    }

    // Get approved reviews for this listing
    const reviews = await prisma.review.findMany({
      where: {
        listingId: listing.id,
        approved: true
      },
      orderBy: [
        { pinned: 'desc' },
        { submittedAt: 'desc' }
      ]
    });

    return NextResponse.json({
      status: "success",
      result: {
        listing,
        reviews
      }
    });
  } catch (error) {
    console.error("Error fetching listing:", error);
    return NextResponse.json(
      { status: "error", error: "Failed to fetch listing" },
      { status: 500 }
    );
  }
}

// PATCH /api/listings/[slug] - Update listing (for editing by ID)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const id = decodeURIComponent(resolvedParams.slug); // This will be the ID when called from edit page
  
  try {
    const body = await request.json();
    const { name, slug, hostawayMapId, googlePlaceId } = body;

    if (!name?.trim() || !slug?.trim()) {
      return NextResponse.json(
        { status: "error", error: "Name and slug are required" },
        { status: 400 }
      );
    }

    // Check if slug already exists (excluding current listing)
    const existingListing = await prisma.listing.findFirst({
      where: { 
        slug: slug.trim(),
        NOT: { id }
      }
    });

    if (existingListing) {
      return NextResponse.json(
        { status: "error", error: "A listing with this slug already exists" },
        { status: 400 }
      );
    }

    const listing = await prisma.listing.update({
      where: { id },
      data: {
        name: name.trim(),
        slug: slug.trim(),
        hostawayMapId: hostawayMapId || null,
        googlePlaceId: googlePlaceId?.trim() || null
      }
    });

    return NextResponse.json({
      status: "success",
      result: listing
    });
  } catch (error) {
    console.error("Error updating listing:", error);
    return NextResponse.json(
      { status: "error", error: "Failed to update listing" },
      { status: 500 }
    );
  }
}

// DELETE /api/listings/[slug] - Delete listing (for editing by ID)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const id = decodeURIComponent(resolvedParams.slug); // This will be the ID when called from edit page
  
  try {
    await prisma.listing.delete({
      where: { id }
    });

    return NextResponse.json({
      status: "success",
      message: "Listing deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting listing:", error);
    return NextResponse.json(
      { status: "error", error: "Failed to delete listing" },
      { status: 500 }
    );
  }
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");
  const headers = corsHeaders(origin);
  return new NextResponse(null, { status: 204, headers });
}
