const { PrismaClient } = require('@prisma/client');

async function setupVercelDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Setting up Vercel database...');
    
    // Check if database is accessible
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Check if tables exist
    const listings = await prisma.listing.findMany();
    console.log(`📊 Found ${listings.length} listings in database`);
    
    if (listings.length === 0) {
      console.log('🌱 Database appears empty, running seed...');
      
      // Create listings
      const listingsData = [
        {
          id: "cmeb4a49g0000uxl0y2w7eh6f",
          name: "2B N1 A - 29 Shoreditch Heights",
          slug: "shoreditch-heights-a",
          address: "29 Shoreditch Heights, London",
          hostawayMapId: 1001,
          googlePlaceId: null,
        },
        {
          id: "cmeb4a49g0001uxl0y2w7eh6g",
          name: "3B SW11 C - 15 Battersea Riverside",
          slug: "battersea-riverside-c", 
          address: "15 Battersea Riverside, London",
          hostawayMapId: 1003,
          googlePlaceId: null,
        },
        {
          id: "cmeb4a49g0002uxl0y2w7eh6h",
          name: "1B NW1 B - 8 Camden Loft",
          slug: "camden-loft-b",
          address: "8 Camden Loft, London", 
          hostawayMapId: 1002,
          googlePlaceId: null,
        }
      ];
      
      for (const listing of listingsData) {
        await prisma.listing.upsert({
          where: { id: listing.id },
          update: {},
          create: listing
        });
      }
      
      // Create sample reviews
      const reviewsData = [
        {
          id: "hostaway:rev001",
          source: "hostaway",
          listingId: "cmeb4a49g0001uxl0y2w7eh6g",
          approved: false,
          pinned: true
        },
        {
          id: "hostaway:rev004", 
          source: "hostaway",
          listingId: "cmeb4a49g0000uxl0y2w7eh6f",
          approved: false,
          pinned: false
        },
        {
          id: "hostaway:rev020",
          source: "hostaway", 
          listingId: "cmeb4a49g0000uxl0y2w7eh6f",
          approved: false,
          pinned: true
        }
      ];
      
      for (const review of reviewsData) {
        await prisma.review.upsert({
          where: { id: review.id },
          update: {},
          create: review
        });
      }
      
      console.log('✅ Database seeded successfully');
    }
    
    console.log('🎉 Vercel database setup complete!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  setupVercelDatabase();
}

module.exports = { setupVercelDatabase };
