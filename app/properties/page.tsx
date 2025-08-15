import Link from "next/link";
import Image from "next/image";
import { StarRating } from "@/components/StarRating";

// Mock data for properties - in production this would come from API
const properties = [
  {
    slug: "shoreditch-heights-a",
    name: "Shoreditch Heights A",
    location: "Shoreditch, London",
    rating: 4.8,
    reviewCount: 127,
    price: "£89",
    image: "/images/shoreditch-heights-a/hero.jpg",
    amenities: ["WiFi", "Kitchen", "Washer", "Air conditioning"]
  },
  {
    slug: "camden-loft-b", 
    name: "Camden Loft B",
    location: "Camden, London",
    rating: 4.6,
    reviewCount: 89,
    price: "£95",
    image: "/images/camden-loft-b/hero.jpg",
    amenities: ["WiFi", "Kitchen", "Parking", "Gym"]
  },
  {
    slug: "battersea-riverside-c",
    name: "Battersea Riverside C", 
    location: "Battersea, London",
    rating: 4.9,
    reviewCount: 156,
    price: "£120",
    image: "/images/battersea-riverside-c/hero.jpg",
    amenities: ["WiFi", "Kitchen", "Pool", "River view"]
  }
];

export default function PropertiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-bg via-bg to-brand-700/5">
      <div className="container py-section">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-display-lg font-bold text-text-primary mb-4">
            Our Properties
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Discover exceptional stays across London with Flex Living. Each property is carefully selected and maintained to provide you with comfort, convenience, and style.
          </p>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {properties.map((property) => (
            <Link
              key={property.slug}
              href={`/properties/${property.slug}`}
              className="group block"
            >
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200/50 hover:scale-[1.02]">
                {/* Property Image */}
                <div className="relative h-64 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10" />
                  <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-brand-700">
                    {property.price}/night
                  </div>
                  {/* Property Image */}
                  <Image
                    src={property.slug === 'shoreditch-heights-a' ? '/property-1a.jpeg' : 
                         property.slug === 'camden-loft-b' ? '/property-2a.jpeg' : 
                         '/property-3a.jpeg'}
                    alt={property.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>

                {/* Property Details */}
                <div className="p-6">
                  <div className="mb-3">
                    <h3 className="text-xl font-bold text-text-primary group-hover:text-brand-700 transition-colors">
                      {property.name}
                    </h3>
                    <p className="text-text-secondary mt-1">{property.location}</p>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    <StarRating value={property.rating} />
                    <span className="text-sm font-medium text-text-primary">
                      London&apos;s most vibrant neighborhoods
                    </span>
                    <span className="text-sm text-text-secondary">
                      ({property.reviewCount} reviews)
                    </span>
                  </div>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.slice(0, 3).map((amenity) => (
                      <span
                        key={amenity}
                        className="px-2 py-1 bg-brand-50 text-brand-700 text-xs rounded-full font-medium"
                      >
                        {amenity}
                      </span>
                    ))}
                    {property.amenities.length > 3 && (
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full font-medium">
                        +{property.amenities.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-2xl p-8 shadow-lg border border-slate-200/50">
          <h2 className="text-2xl font-bold text-text-primary mb-4">
            Can&apos;t find what you&apos;re looking for?
          </h2>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            Contact our team to discuss custom accommodations or upcoming properties in your preferred area.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 bg-brand-700 text-white font-medium rounded-xl hover:bg-brand-800 transition-colors"
            >
              Contact Us
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-6 py-3 border border-brand-700 text-brand-700 font-medium rounded-xl hover:bg-brand-50 transition-colors"
            >
              Manager Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
