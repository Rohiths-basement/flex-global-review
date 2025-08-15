"use client";
import Link from "next/link";
import { StarRating } from "@/components/StarRating";
import { formatDateUTC } from "@/lib/date";
import Image from "next/image";
import { useState, useEffect, use } from "react";

async function getData(slug: string) {
  try {
    const res = await fetch(`/api/listings/${encodeURIComponent(slug)}`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to load listing");
    return res.json();
  } catch (error) {
    console.error('Failed to load listing:', error instanceof Error ? error.message : error);
  }
}

// About Property Component with Read More functionality
function AboutPropertySection() {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const shortText = "This cozy apartment features 2 bedrooms with double beds, 1 bathroom, and a fully equipped kitchen. The spacious living room includes an air mattress for 1 extra guest, accommodating up to 5 people in total.";
  
  const fullText = `This cozy apartment features 2 bedrooms with double beds, 1 bathroom, and a fully equipped kitchen. The spacious living room includes an air mattress for 1 extra guest, accommodating up to 5 people in total. Perfectly located in a vibrant neighborhood, it's ideal for a comfortable stay.

This charming and spacious 2-bedroom apartment offers a comfortable and welcoming space for up to 5 guests. Both bedrooms are furnished with cozy double beds, ensuring a restful night's sleep for two guests per room. The apartment features a well-maintained bathroom with all the essentials you'll need during your stay.

The fully equipped kitchen allows you to prepare meals at your convenience, whether you're enjoying a homemade breakfast or a delicious dinner. The spacious living room is designed for relaxation, featuring ample seating and an air mattress that accommodates one extra guest, bringing the total capacity of the apartment to 5 people.

Your comfort is our priority, so if you need anything or if we can help you in any way, please don't hesitate to let us know – we'll always be happy to assist you!

Located in the lively and vibrant neighborhood, this area offers the perfect mix of charm, convenience, and local culture. The street is known for its trendy cafes, cozy boutiques, and a welcoming atmosphere that makes it ideal for visitors looking to experience the true essence of the city.`;

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">About this property</h2>
      <div className="text-gray-700 space-y-4">
        <div className="whitespace-pre-line">
          {isExpanded ? fullText : shortText}
        </div>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-teal-700 font-medium hover:underline"
        >
          {isExpanded ? 'Read less' : 'Read more'}
        </button>
      </div>
    </div>
  );
}

// Stay Policies Component
function StayPoliciesSection() {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Stay Policies</h2>
      
      {/* Check-in & Check-out */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="font-semibold text-gray-900">Check-in & Check-out</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Check-in time</p>
            <p className="font-semibold">3:00 PM</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Check-out time</p>
            <p className="font-semibold">10:00 AM</p>
          </div>
        </div>
      </div>

      {/* House Rules */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="font-semibold text-gray-900">House Rules</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
            </svg>
            <span className="text-gray-700">No smoking</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
            </svg>
            <span className="text-gray-700">No pets</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
            </svg>
            <span className="text-gray-700">No parties or events</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-gray-700">Security deposit required</span>
          </div>
        </div>
      </div>

      {/* Cancellation Policy */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="font-semibold text-gray-900">Cancellation Policy</h3>
        </div>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">For stays less than 28 days</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Full refund up to 14 days before check-in</li>
              <li>• No refund for bookings less than 14 days before check-in</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">For stays of 28 days or more</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Full refund up to 30 days before check-in</li>
              <li>• No refund for bookings less than 30 days before check-in</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Location Component with dummy map
function LocationSection() {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Location</h2>
      
      {/* Dummy Map */}
      <div className="relative h-64 bg-gray-100 rounded-lg overflow-hidden mb-4">
        <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100">
          {/* Dummy map elements */}
          <div className="absolute top-4 left-4 bg-white rounded px-2 py-1 text-xs font-medium shadow">
            📍 Central Location
          </div>
          
          {/* Dummy streets */}
          <div className="absolute top-16 left-8 w-32 h-0.5 bg-gray-300 rotate-12"></div>
          <div className="absolute top-20 left-16 w-24 h-0.5 bg-gray-300 -rotate-12"></div>
          <div className="absolute top-24 left-12 w-28 h-0.5 bg-gray-300 rotate-45"></div>
          
          {/* Dummy buildings */}
          <div className="absolute top-12 right-16 w-4 h-6 bg-gray-400 rounded-sm"></div>
          <div className="absolute top-16 right-12 w-3 h-4 bg-gray-500 rounded-sm"></div>
          <div className="absolute top-20 right-20 w-5 h-8 bg-gray-400 rounded-sm"></div>
          
          {/* Property marker */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center shadow-lg">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
          </div>
          
          {/* Dummy labels */}
          <div className="absolute bottom-16 left-8 text-xs text-gray-600 font-medium">BELLEVILLE</div>
          <div className="absolute bottom-12 right-16 text-xs text-gray-600 font-medium">RÉPUBLIQUE</div>
          <div className="absolute top-8 right-8 text-xs text-gray-600 font-medium">CANAL ST MARTIN</div>
        </div>
        
        {/* Map controls */}
        <div className="absolute bottom-4 left-4 flex flex-col gap-1">
          <button className="w-8 h-8 bg-white rounded shadow flex items-center justify-center text-gray-600 hover:bg-gray-50">
            +
          </button>
          <button className="w-8 h-8 bg-white rounded shadow flex items-center justify-center text-gray-600 hover:bg-gray-50">
            −
          </button>
        </div>
        
        {/* Google attribution */}
        <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white bg-opacity-80 px-1 rounded">
          Map data ©2024 Google
        </div>
      </div>
      
      <div className="text-sm text-gray-600">
        <p className="mb-2">Located in a vibrant neighborhood with easy access to public transportation, restaurants, and local attractions.</p>
        <p>Walking distance to metro stations and major landmarks.</p>
      </div>
    </div>
  );
}

export default function PropertyPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const [data, setData] = useState<{ result?: { listing?: unknown; reviews?: unknown[] } } | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    getData(resolvedParams.slug).then(result => {
      setData(result);
      setLoading(false);
    });
  }, [resolvedParams.slug]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#FFFDF6" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }
  
  return <PropertyPageContent data={data} slug={resolvedParams.slug} />;
}

function PropertyPageContent({ data, slug }: { data: { result?: { listing?: unknown; reviews?: unknown[] } } | null; slug: string }) {
  const decodedSlug = decodeURIComponent(slug);
  const listing = data?.result?.listing;
  type ApprovedReview = {
    id: string;
    source: string;
    channel: string | null;
    type: string | null;
    rating: number | null;
    ratingRaw: number | null;
    categories: unknown;
    text: string | null;
    languageCode: string | null;
    authorName: string | null;
    submittedAt: string | null;
    approved: boolean;
    pinned: boolean;
  };
  const reviews: ApprovedReview[] = (data?.result?.reviews ?? []) as ApprovedReview[];
  const hasGoogle = reviews.some((r) => r.source === "google");
  const rated = reviews.filter((r) => r.rating != null) as { rating: number }[];
  const ratingCount = rated.length;
  const avgRating = ratingCount ? Math.round((rated.reduce((s, r) => s + r.rating, 0) / ratingCount) * 10) / 10 : null;

  const imageMap: Record<string, string[]> = {
    "shoreditch-heights-a": ["/property-1a.jpeg", "/property-1b.jpeg", "/property-1a.jpeg", "/property-1b.jpeg", "/property-1a.jpeg"],
    "camden-loft-b": ["/property-2a.jpeg", "/property-2b.jpeg", "/property-2a.jpeg", "/property-2b.jpeg", "/property-2a.jpeg"],
    "battersea-riverside-c": ["/property-3a.jpeg", "/property-3b.jpeg", "/property-3a.jpeg", "/property-3b.jpeg", "/property-3a.jpeg"],
  };
  const images = imageMap[decodedSlug] || imageMap["shoreditch-heights-a"];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FFFDF6" }}>
      {/* Header spacing */}
      <div style={{ paddingTop: "88px" }} />
      
      {/* Main content */}
      <main className="flex-grow">

        {/* Hero Image Gallery */}
        <section className="px-4 md:px-8 lg:px-16 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-w-7xl mx-auto">
            {/* Main large image */}
            <div className="col-span-2 row-span-2">
              <div className="relative h-[400px] md:h-[500px] rounded-lg overflow-hidden">
                <Image
                  src={images[0]}
                  alt="Main property view"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
            
            {/* Smaller images */}
            {images.slice(1, 5).map((img, idx) => (
              <div key={idx} className="relative h-[195px] md:h-[245px] rounded-lg overflow-hidden">
                <Image
                  src={img}
                  alt={`Property view ${idx + 2}`}
                  fill
                  className="object-cover"
                />
                {idx === 3 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <button className="text-white text-sm font-medium flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      View all photos
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Property Details */}
        <section className="px-4 md:px-8 lg:px-16 py-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Property Info */}
            <div className="lg:col-span-2 space-y-8">
              {/* Title and Basic Info */}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {listing?.name ?? decodedSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </h1>
                
                <div className="flex items-center gap-6 text-gray-600 mb-6">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>5 guests</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    </svg>
                    <span>2 bedrooms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                    </svg>
                    <span>1 bathrooms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    </svg>
                    <span>3 beds</span>
                  </div>
                </div>
              </div>

              {/* About this property */}
              <AboutPropertySection />

              {/* Amenities */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Amenities</h2>
                  <button className="text-teal-700 font-medium hover:underline flex items-center gap-1">
                    View all amenities
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { icon: "📺", name: "Cable TV" },
                    { icon: "🌐", name: "Internet" },
                    { icon: "📶", name: "Wireless" },
                    { icon: "🍳", name: "Kitchen" },
                    { icon: "🧺", name: "Washing Machine" },
                    { icon: "💨", name: "Hair Dryer" },
                    { icon: "🔥", name: "Heating" },
                    { icon: "🚨", name: "Smoke Detector" },
                    { icon: "⚠️", name: "Carbon Monoxide Detector" }
                  ].map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-3 py-2">
                      <span className="text-lg">{amenity.icon}</span>
                      <span className="text-gray-700">{amenity.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stay Policies */}
              <StayPoliciesSection />

              {/* Location */}
              <LocationSection />

              {/* Guest Reviews Section */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Guest Reviews</h2>
                  {avgRating != null && (
                    <div className="flex items-center gap-2">
                      <StarRating value={avgRating} />
                      <span className="text-gray-600">{avgRating} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
                    </div>
                  )}
                </div>

                {reviews.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p>No approved reviews yet.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-gray-600 font-medium">
                                {review.authorName ? review.authorName.charAt(0).toUpperCase() : 'G'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{review.authorName || 'Guest'}</p>
                              <div className="flex items-center gap-2">
                                <StarRating value={review.rating} />
                                <span className="text-sm text-gray-500">{formatDateUTC(review.submittedAt)}</span>
                                {review.pinned && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pinned</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                            {review.source}{review.channel ? ` / ${review.channel}` : ''}
                          </div>
                        </div>
                        {review.text && (
                          <p className="text-gray-700 leading-relaxed">{review.text}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {hasGoogle && (
                  <div className="mt-4 text-xs text-gray-500 border-t pt-4">
                    Some reviews provided by Google.
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Booking Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="bg-teal-700 text-white rounded-lg p-6 shadow-lg">
                  <h3 className="text-xl font-semibold mb-2">Book your stay</h3>
                  <p className="text-teal-100 mb-6">Select dates to see the total price</p>
                  
                  <div className="space-y-4">
                    <div className="bg-white bg-opacity-10 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-teal-100">Select dates</span>
                        <span className="text-teal-100">1</span>
                      </div>
                    </div>
                    
                    <button className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-medium py-3 rounded-lg transition-colors">
                      Check availability
                    </button>
                    
                    <button className="w-full bg-transparent border border-white border-opacity-30 hover:border-opacity-50 text-white font-medium py-3 rounded-lg transition-colors">
                      Send Inquiry
                    </button>
                    
                    <div className="text-center">
                      <span className="text-teal-100 text-sm">⚡ Instant confirmation</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-white border-opacity-20">
                    <Link href="/dashboard" className="text-teal-100 hover:text-white text-sm underline">
                      View Dashboard
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
