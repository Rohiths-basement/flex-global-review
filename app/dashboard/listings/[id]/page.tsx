"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";

interface Listing {
  id: string;
  name: string;
  slug: string;
  hostawayMapId: number | null;
  googlePlaceId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface GooglePlacePreview {
  name: string;
  rating: number;
  userRatingCount: number;
  reviews: Array<{
    authorName: string;
    rating: number;
    text: string;
    time: string;
  }>;
}

export default function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [googlePreview, setGooglePreview] = useState<GooglePlacePreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    hostawayMapId: "",
    googlePlaceId: ""
  });

  useEffect(() => {
    fetchListing();
  }, [resolvedParams.id]);

  const fetchListing = async () => {
    try {
      const response = await fetch(`/api/listings/${resolvedParams.id}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError("Listing not found");
          return;
        }
        throw new Error('Failed to fetch listing');
      }
      
      const data = await response.json();
      const listingData = data.result?.listing || data.result;
      setListing(listingData);
      setFormData({
        name: listingData.name || "",
        slug: listingData.slug || "",
        hostawayMapId: listingData.hostawayMapId?.toString() || "",
        googlePlaceId: listingData.googlePlaceId || ""
      });

      // Load Google preview if Place ID exists
      if (listingData.googlePlaceId) {
        loadGooglePreview(listingData.googlePlaceId);
      }
    } catch (err) {
      setError('Failed to load listing');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadGooglePreview = async (placeId: string) => {
    if (!placeId.trim()) return;
    
    setLoadingPreview(true);
    try {
      const response = await fetch(`/api/reviews/google?placeId=${encodeURIComponent(placeId)}&preview=true`);
      if (response.ok) {
        const data = await response.json();
        setGooglePreview(data.place);
      }
    } catch (err) {
      console.error('Failed to load Google preview:', err);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");

    // Auto-generate slug from name
    if (name === 'name') {
      const slug = value.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }

    // Load Google preview when Place ID changes
    if (name === 'googlePlaceId' && value !== formData.googlePlaceId) {
      setGooglePreview(null);
      if (value.trim()) {
        const timeoutId = setTimeout(() => loadGooglePreview(value), 500);
        return () => clearTimeout(timeoutId);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        hostawayMapId: formData.hostawayMapId ? parseInt(formData.hostawayMapId) : null,
        googlePlaceId: formData.googlePlaceId.trim() || null
      };

      const response = await fetch(`/api/listings/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update listing');
      }

      setSuccess("Listing updated successfully!");
      fetchListing(); // Refresh data
    } catch (err: any) {
      setError(err.message || 'Failed to update listing');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/listings/${resolvedParams.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete listing');
      
      router.push('/dashboard/listings');
    } catch (err) {
      setError('Failed to delete listing');
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#FFFDF6" }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading listing...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (error && !listing) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#FFFDF6" }}>
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Listing Not Found</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link 
              href="/dashboard/listings"
              className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              ← Back to Listings
            </Link>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen" style={{ backgroundColor: "#FFFDF6" }}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <Link 
                  href="/dashboard/listings"
                  className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2"
                >
                  ← Back to Listings
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Edit Listing</h1>
                <p className="text-gray-600 mt-1">
                  Configure property details and Google Places integration
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Listing Details</h2>
                
                {error && (
                  <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-red-700">{error}</span>
                    </div>
                  </div>
                )}

                {success && (
                  <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-green-700">{success}</span>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Property Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL Slug *
                    </label>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      URL: /properties/{formData.slug}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hostaway Map ID
                    </label>
                    <input
                      type="number"
                      name="hostawayMapId"
                      value={formData.hostawayMapId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      placeholder="e.g., 12345"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Optional: Link to Hostaway property for review sync
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Google Place ID
                    </label>
                    <input
                      type="text"
                      name="googlePlaceId"
                      value={formData.googlePlaceId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      placeholder="e.g., ChIJN1t_tDeuEmsRUsoyG83frY4"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Optional: Connect Google reviews and ratings
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 text-sm font-medium"
                    >
                      Delete Listing
                    </button>
                    <div className="flex items-center gap-3">
                      <Link
                        href="/dashboard/listings"
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                      >
                        Cancel
                      </Link>
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Google Preview Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Google Places Preview</h3>
                
                {!formData.googlePlaceId ? (
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-gray-500 text-sm">
                      Enter a Google Place ID to see preview
                    </p>
                  </div>
                ) : loadingPreview ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
                    <p className="text-gray-500 text-sm">Loading preview...</p>
                  </div>
                ) : googlePreview ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900">{googlePreview.name}</h4>
                      <div className="flex items-center mt-1">
                        <div className="flex items-center">
                          <span className="text-yellow-400">★</span>
                          <span className="ml-1 text-sm text-gray-600">
                            {googlePreview.rating} ({googlePreview.userRatingCount} reviews)
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {googlePreview.reviews && googlePreview.reviews.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Recent Reviews</h5>
                        <div className="space-y-3">
                          {googlePreview.reviews.slice(0, 3).map((review, index) => (
                            <div key={index} className="text-xs">
                              <div className="flex items-center mb-1">
                                <span className="font-medium text-gray-900">{review.authorName}</span>
                                <span className="ml-2 text-yellow-400">
                                  {'★'.repeat(review.rating)}
                                </span>
                              </div>
                              <p className="text-gray-600 line-clamp-3">
                                {review.text.length > 100 
                                  ? review.text.substring(0, 100) + '...' 
                                  : review.text
                                }
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-600 text-sm">
                      Invalid Place ID or no data found
                    </p>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    href={`/properties/${formData.slug}`}
                    target="_blank"
                    className="block w-full px-4 py-2 text-center border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                  >
                    View Public Page ↗
                  </Link>
                  <Link
                    href={`/dashboard?listingMapId=${listing?.hostawayMapId || ''}`}
                    className="block w-full px-4 py-2 text-center border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                  >
                    View Reviews
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
