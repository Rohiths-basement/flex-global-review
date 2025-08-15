import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/listings - List all listings
export async function GET() {
  try {
    const listings = await prisma.listing.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        hostawayMapId: true,
        googlePlaceId: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { name: 'asc' }
    });

    // Get review counts and ratings for each listing
    const listingsWithStats = await Promise.all(
      listings.map(async (listing: typeof listings[0]) => {
        const reviewsCount = await prisma.review.count({
          where: {
            OR: [
              { listingId: listing.id },
              { listingMapId: listing.hostawayMapId }
            ]
          }
        });

        const avgRating = await prisma.review.aggregate({
          where: {
            OR: [
              { listingId: listing.id },
              { listingMapId: listing.hostawayMapId }
            ],
            rating: { not: null }
          },
          _avg: { rating: true }
        });

        const lastSync = await prisma.review.findFirst({
          where: {
            OR: [
              { listingId: listing.id },
              { listingMapId: listing.hostawayMapId }
            ]
          },
          orderBy: { createdAt: 'desc' },
          select: { createdAt: true }
        });

        return {
          ...listing,
          reviewsCount,
          averageRating: avgRating._avg.rating,
          lastSync: lastSync?.createdAt?.toISOString() || null
        };
      })
    );

    return NextResponse.json({
      status: "success",
      result: listingsWithStats
    });
  } catch (error) {
    console.error("Error fetching listings:", error);
    return NextResponse.json(
      { status: "error", error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}

// POST /api/listings - Create new listing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, hostawayMapId, googlePlaceId } = body;

    if (!name?.trim() || !slug?.trim()) {
      return NextResponse.json(
        { status: "error", error: "Name and slug are required" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingListing = await prisma.listing.findUnique({
      where: { slug: slug.trim() }
    });

    if (existingListing) {
      return NextResponse.json(
        { status: "error", error: "A listing with this slug already exists" },
        { status: 400 }
      );
    }

    const listing = await prisma.listing.create({
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
    console.error("Error creating listing:", error);
    return NextResponse.json(
      { status: "error", error: "Failed to create listing" },
      { status: 500 }
    );
  }
}
