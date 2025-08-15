// Vercel-compatible database configuration
import { PrismaClient } from '@prisma/client'

declare global {
  var __prisma: PrismaClient | undefined
}

// For Vercel deployment, we'll use a fallback approach
export const prisma = globalThis.__prisma || new PrismaClient({
  log: ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}

// Fallback data for when database is not available (like on Vercel without DB setup)
export const fallbackListings = [
  {
    id: "listing-1",
    name: "Shoreditch Heights A",
    slug: "shoreditch-heights-a",
    hostawayMapId: 1001,
    description: "Modern apartment in trendy Shoreditch",
    location: "Shoreditch, London",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "listing-2", 
    name: "Battersea Riverside C",
    slug: "battersea-riverside-c",
    hostawayMapId: 1003,
    description: "Riverside apartment with Thames views",
    location: "Battersea, London", 
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "listing-3",
    name: "Camden Loft B", 
    slug: "camden-loft-b",
    hostawayMapId: 1002,
    description: "Spacious loft in vibrant Camden",
    location: "Camden, London",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const fallbackReviews = [
  {
    id: "hostaway:rev001",
    listingId: "listing-2",
    approved: true,
    pinned: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "hostaway:rev004", 
    listingId: "listing-1",
    approved: true,
    pinned: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "hostaway:rev020",
    listingId: "listing-1", 
    approved: true,
    pinned: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Database operation with fallback
export async function safeDbOperation<T>(
  operation: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.warn('Database operation failed, using fallback:', error);
    return fallback;
  }
}
