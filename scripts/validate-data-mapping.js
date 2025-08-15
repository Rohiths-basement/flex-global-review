const { PrismaClient } = require('@prisma/client');
const mockData = require('../data/hostaway-mock.json');

async function validateDataMapping() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Validating data mapping consistency...\n');
    
    // Get database mappings
    const reviews = await prisma.review.findMany({ 
      select: { id: true, listingId: true },
      orderBy: { id: 'asc' }
    });
    
    const listings = await prisma.listing.findMany({ 
      select: { id: true, slug: true, hostawayMapId: true } 
    });
    
    // Create mapping objects
    const listingIdToMapId = {};
    const listingSlugToMapId = {};
    listings.forEach(l => {
      listingIdToMapId[l.id] = l.hostawayMapId;
      listingSlugToMapId[l.slug] = l.hostawayMapId;
    });
    
    // Validate each review
    let errors = 0;
    let warnings = 0;
    
    for (const review of reviews) {
      const revId = review.id.replace('hostaway:', '');
      const mockReview = mockData.find(m => m.id === revId);
      
      if (!mockReview) {
        console.log(`❌ ERROR: Review ${revId} exists in database but not in mock data`);
        errors++;
        continue;
      }
      
      const dbListingMapId = listingIdToMapId[review.listingId];
      const mockListingMapId = mockReview.listingMapId;
      
      if (dbListingMapId !== mockListingMapId) {
        console.log(`❌ ERROR: Review ${revId} mapping mismatch:`);
        console.log(`   Database: listingMapId ${dbListingMapId}`);
        console.log(`   Mock data: listingMapId ${mockListingMapId}`);
        errors++;
      }
    }
    
    // Check for orphaned mock reviews
    for (const mockReview of mockData) {
      const dbReview = reviews.find(r => r.id === `hostaway:${mockReview.id}`);
      if (!dbReview) {
        console.log(`⚠️  WARNING: Mock review ${mockReview.id} not found in database`);
        warnings++;
      }
    }
    
    console.log(`\n📊 Validation Results:`);
    console.log(`   ✅ Total reviews checked: ${reviews.length}`);
    console.log(`   ❌ Errors found: ${errors}`);
    console.log(`   ⚠️  Warnings: ${warnings}`);
    
    if (errors === 0 && warnings === 0) {
      console.log(`\n🎉 All data mappings are consistent!`);
    } else {
      console.log(`\n🔧 Please fix the above issues to ensure proper data consistency.`);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  validateDataMapping();
}

module.exports = { validateDataMapping };
