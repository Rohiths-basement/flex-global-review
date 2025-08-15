"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/AuthGuard";
import { formatDateUTC } from "@/lib/date";

interface Listing {
  id: string;
  name: string;
  slug: string;
  hostawayMapId: number | null;
  googlePlaceId: string | null;
  reviewsCount: number;
  lastSync: string | null;
  averageRating: number | null;
}

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newListing, setNewListing] = useState({
    name: "",
    slug: ""
  });

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const response = await fetch('/api/listings');
      if (!response.ok) throw new Error('Failed to fetch listings');
      const data = await response.json();
      setListings(data.result || []);
    } catch (err) {
      setError('Failed to load listings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListing.name.trim()) return;

    try {
      const slug = newListing.slug || newListing.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newListing.name.trim(),
          slug
        })
      });

      if (!response.ok) throw new Error('Failed to create listing');
      
      setNewListing({ name: "", slug: "" });
      setShowAddForm(false);
      fetchListings();
    } catch (err) {
      setError('Failed to create listing');
      console.error(err);
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#FFFDF6" }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading listings...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen" style={{ backgroundColor: "#FFFDF6" }}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Listings Management</h1>
                <p className="text-gray-600">Manage your property listings and configure Google Place IDs</p>
              </div>
              <div className="flex items-center gap-4">
                <Link 
                  href="/dashboard"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  ← Back to Dashboard
                </Link>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Listing
                </button>
              </div>
            </div>
          </div>

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

          {/* Add Listing Form */}
          {showAddForm && (
            <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Listing</h2>
              <form onSubmit={handleAddListing} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Property Name *
                    </label>
                    <input
                      type="text"
                      value={newListing.name}
                      onChange={(e) => {
                        setNewListing(prev => ({
                          ...prev,
                          name: e.target.value,
                          slug: generateSlug(e.target.value)
                        }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      placeholder="e.g., Shoreditch Heights Apartment A"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL Slug
                    </label>
                    <input
                      type="text"
                      value={newListing.slug}
                      onChange={(e) => setNewListing(prev => ({ ...prev, slug: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      placeholder="shoreditch-heights-a"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Will be used in URL: /properties/{newListing.slug}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700"
                  >
                    Create Listing
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewListing({ name: "", slug: "" });
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Listings Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Property Listings ({listings.length})
              </h2>
            </div>
            
            {listings.length === 0 ? (
              <div className="p-12 text-center">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No listings yet</h3>
                <p className="text-gray-600 mb-4">Get started by adding your first property listing.</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700"
                >
                  Add Your First Listing
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Property
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hostaway ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Google Place ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reviews
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Sync
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {listings.map((listing) => (
                      <tr key={listing.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{listing.name}</div>
                            <div className="text-sm text-gray-500">
                              <Link 
                                href={`/properties/${listing.slug}`}
                                className="text-teal-600 hover:text-teal-800"
                                target="_blank"
                              >
                                /properties/{listing.slug} ↗
                              </Link>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900">
                            {listing.hostawayMapId ? `#${listing.hostawayMapId}` : (
                              <span className="text-gray-400">Not set</span>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {listing.googlePlaceId ? (
                            <div className="flex items-center">
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                Connected
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                              Not connected
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-900">{listing.reviewsCount}</span>
                            {listing.averageRating && (
                              <span className="ml-2 text-xs text-gray-500">
                                ({listing.averageRating.toFixed(1)}★)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-500">
                            {listing.lastSync ? formatDateUTC(listing.lastSync) : 'Never'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            href={`/dashboard/listings/${listing.id}`}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                          >
                            Edit
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
