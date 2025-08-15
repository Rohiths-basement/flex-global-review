"use client";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatDateUTC } from "@/lib/date";
import { ApproveToggle } from "@/components/ApproveToggle";
import { StarRating } from "@/components/StarRating";
import { PinToggle } from "@/components/PinToggle";
import { Sparkline, type SparkPoint } from "@/components/Sparkline";
import { getCurrentUser, logout } from "@/lib/auth";

interface Review {
  id: string;
  rating: number | null;
  text: string;
  authorName: string;
  submittedAt: string;
  channel: string;
  type: string;
  approved: boolean;
  pinned: boolean;
  source: string;
  listingMapId: number | null;
  categories?: Record<string, number>;
}

interface Listing {
  name: string;
  slug: string;
  hostawayMapId: number | null;
}

interface DashboardData {
  items: Review[];
  total: number;
  avgRating: number;
  hostawayAvg: number;
  googleAvg: number;
  totalReviews: number;
  highRatingPercent: number;
  sparklineData: SparkPoint[];
}

export default function DashboardClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user] = useState(getCurrentUser());
  const [selectedReviews, setSelectedReviews] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  // Extract search parameters
  const sourceParam = searchParams.get("source") ?? "hostaway";
  const listingMapIdParam = searchParams.get("listingMapId") ?? "";
  const listingMapId = listingMapIdParam && !Number.isNaN(Number(listingMapIdParam)) ? Number(listingMapIdParam) : undefined;
  const limitParam = Number(searchParams.get("limit") ?? "50");
  const offsetParam = Number(searchParams.get("offset") ?? "0");
  const approvedParam = searchParams.get("approved") ?? "all";
  const pinnedParam = searchParams.get("pinned") ?? "all";
  const channelParam = searchParams.get("channel") ?? "";
  const typeParam = searchParams.get("type") ?? "";
  const ratingMinParam = searchParams.get("ratingMin") ?? "";
  const ratingMaxParam = searchParams.get("ratingMax") ?? "";
  const fromParam = searchParams.get("from") ?? "";
  const toParam = searchParams.get("to") ?? "";
  const sortParam = searchParams.get("sort") ?? "date_desc";
  const categoryNameParam = searchParams.get("categoryName") ?? "";
  const categoryMinParam = searchParams.get("categoryMin") ?? "";

  useEffect(() => {
    fetchData();
    fetchListings();
  }, [searchParams]);

  const fetchListings = async () => {
    try {
      const response = await fetch('/api/listings');
      if (response.ok) {
        const result = await response.json();
        setListings(result.result || []);
      }
    } catch (err) {
      console.error('Failed to fetch listings:', err);
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const url = new URL(
        sourceParam === "google" ? "/api/reviews/google" : "/api/reviews/hostaway",
        window.location.origin
      );

      // Build URL parameters
      const mapIdToSlug = new Map<number, string>();
      listings.forEach(l => {
        if (l.hostawayMapId != null) mapIdToSlug.set(l.hostawayMapId, l.slug);
      });

      if (sourceParam === "google") {
        const slug = listingMapId != null ? mapIdToSlug.get(listingMapId) : undefined;
        if (slug) url.searchParams.set("listingSlug", slug);
      } else if (listingMapId) {
        url.searchParams.set("listingMapId", String(listingMapId));
      }

      url.searchParams.set("limit", String(limitParam));
      url.searchParams.set("offset", String(offsetParam));
      if (approvedParam !== "all") url.searchParams.set("approved", approvedParam);
      if (pinnedParam !== "all") url.searchParams.set("pinned", pinnedParam);
      if (channelParam) url.searchParams.set("channel", channelParam);
      if (typeParam) url.searchParams.set("type", typeParam);
      if (ratingMinParam) url.searchParams.set("ratingMin", ratingMinParam);
      if (ratingMaxParam) url.searchParams.set("ratingMax", ratingMaxParam);
      if (fromParam) url.searchParams.set("from", fromParam);
      if (toParam) url.searchParams.set("to", toParam);
      if (sortParam) url.searchParams.set("sort", sortParam);
      if (sourceParam === "hostaway" && categoryNameParam) {
        url.searchParams.set("categoryName", categoryNameParam);
        if (categoryMinParam) url.searchParams.set("categoryMin", categoryMinParam);
      }

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Failed to fetch reviews');

      const result = await response.json();
      const items = result.result?.items || result.result || [];
      const total = result.result?.total || items.length;

      // Calculate KPIs
      const avgRating = items.length > 0 
        ? items.reduce((sum: number, item: Review) => sum + (item.rating || 0), 0) / items.filter((item: Review) => item.rating).length 
        : 0;

      const hostawayItems = items.filter((item: Review) => item.source === 'hostaway');
      const googleItems = items.filter((item: Review) => item.source === 'google');
      
      const hostawayAvg = hostawayItems.length > 0 
        ? hostawayItems.reduce((sum: number, item: Review) => sum + (item.rating || 0), 0) / hostawayItems.filter((item: Review) => item.rating).length 
        : 0;
      
      const googleAvg = googleItems.length > 0 
        ? googleItems.reduce((sum: number, item: Review) => sum + (item.rating || 0), 0) / googleItems.filter((item: Review) => item.rating).length 
        : 0;

      const highRatingCount = items.filter((item: Review) => item.rating && item.rating >= 4).length;
      const highRatingPercent = items.length > 0 ? (highRatingCount / items.length) * 100 : 0;

      // Generate mock sparkline data
      const sparklineData: SparkPoint[] = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        value: Math.random() * 2 + 3.5, // Random values between 3.5 and 5.5
        count: Math.floor(Math.random() * 10) + 1 // Random count between 1 and 10
      }));

      setData({
        items,
        total,
        avgRating,
        hostawayAvg,
        googleAvg,
        totalReviews: total,
        highRatingPercent,
        sparklineData
      });
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [sourceParam, listings, listingMapId, limitParam, offsetParam, approvedParam, pinnedParam, channelParam, typeParam, ratingMinParam, ratingMaxParam, sortParam, fromParam, toParam, categoryNameParam, categoryMinParam]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('offset'); // Reset pagination
    router.push(`/dashboard?${params.toString()}`);
  };

  const handleLogout = () => {
    logout();
  };

  // Bulk operations functions
  const toggleSelectAll = () => {
    if (selectedReviews.size === data?.items.length) {
      setSelectedReviews(new Set());
    } else {
      setSelectedReviews(new Set(data?.items.map(r => r.id) || []));
    }
  };

  const toggleSelectReview = (reviewId: string) => {
    const newSelected = new Set(selectedReviews);
    if (newSelected.has(reviewId)) {
      newSelected.delete(reviewId);
    } else {
      newSelected.add(reviewId);
    }
    setSelectedReviews(newSelected);
  };

  const bulkApprove = async (approved: boolean) => {
    if (selectedReviews.size === 0) return;
    
    setBulkLoading(true);
    try {
      const promises = Array.from(selectedReviews).map(reviewId =>
        fetch(`/api/reviews/${reviewId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ approved })
        })
      );
      
      await Promise.all(promises);
      
      // Update local state optimistically
      setData(prev => prev ? {
        ...prev,
        items: prev.items.map(item => 
          selectedReviews.has(item.id) ? { ...item, approved } : item
        )
      } : null);
      
      setSelectedReviews(new Set());
    } catch (error) {
      console.error('Bulk operation failed:', error);
      setError('Failed to update reviews. Please try again.');
    } finally {
      setBulkLoading(false);
    }
  };

  // Keyboard shortcuts - placed after function declarations
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'd':
            e.preventDefault();
            window.location.href = '/dashboard';
            break;
          case 'l':
            e.preventDefault();
            window.location.href = '/properties';
            break;
          case ',':
            e.preventDefault();
            window.location.href = '/dashboard/settings';
            break;
          case 'a':
            e.preventDefault();
            if (e.shiftKey) {
              bulkApprove(true);
            } else {
              toggleSelectAll();
            }
            break;
        }
      }
      if (e.key === 'Escape') {
        setSelectedReviews(new Set());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [bulkApprove, toggleSelectAll, selectedReviews]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#FFFDF6" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FFFDF6" }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reviews Dashboard</h1>
            <p className="text-gray-600">Manage and approve property reviews</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Welcome, {user?.name || user?.email}
            </span>
            <Link
              href="/dashboard/listings"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Manage Listings
            </Link>
            <Link
              href="/dashboard/settings"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 text-red-600 border border-red-300 rounded-lg text-sm font-medium hover:bg-red-50"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
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

        {/* KPIs */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Rating</p>
                  <p className="text-2xl font-bold text-gray-900">{data.avgRating.toFixed(1)}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
              </div>
              <div className="mt-4">
                <Sparkline data={data.sparklineData} height={32} />
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Hostaway Avg</p>
                  <p className="text-2xl font-bold text-gray-900">{data.hostawayAvg.toFixed(1)}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Google Avg</p>
                  <p className="text-2xl font-bold text-gray-900">{data.googleAvg.toFixed(1)}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                  <p className="text-2xl font-bold text-gray-900">{data.totalReviews.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">4-5★ Reviews</p>
                  <p className="text-2xl font-bold text-gray-900">{data.highRatingPercent.toFixed(0)}%</p>
                </div>
                <div className="p-3 bg-teal-100 rounded-full">
                  <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trends & Issues Analysis */}
        {data && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Trends & Issues Analysis
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Common Issues */}
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <h3 className="font-medium text-red-800 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Common Issues
                </h3>
                <div className="space-y-2">
                  {(() => {
                    const issues = data.items
                      .filter(r => r.rating && r.rating < 4)
                      .map(r => r.text.toLowerCase())
                      .join(' ');
                    
                    const commonWords = ['wifi', 'noise', 'clean', 'dirty', 'loud', 'slow', 'problem', 'issue'];
                    const foundIssues = commonWords.filter(word => issues.includes(word));
                    
                    return foundIssues.length > 0 ? foundIssues.slice(0, 3).map(issue => (
                      <div key={issue} className="flex items-center text-sm text-red-700">
                        <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                        {issue.charAt(0).toUpperCase() + issue.slice(1)} mentioned
                      </div>
                    )) : (
                      <div className="text-sm text-red-600">No major issues detected</div>
                    );
                  })()}
                </div>
              </div>

              {/* Rating Trends */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-medium text-blue-800 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Rating Trends
                </h3>
                <div className="space-y-2">
                  {(() => {
                    const recentReviews = data.items
                      .filter(r => r.rating)
                      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
                      .slice(0, 10);
                    
                    const avgRecent = recentReviews.length > 0 
                      ? recentReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / recentReviews.length 
                      : 0;
                    
                    const trend = avgRecent > data.avgRating ? 'improving' : avgRecent < data.avgRating ? 'declining' : 'stable';
                    const trendColor = trend === 'improving' ? 'text-green-700' : trend === 'declining' ? 'text-red-700' : 'text-blue-700';
                    
                    return (
                      <>
                        <div className={`text-sm ${trendColor}`}>
                          Recent trend: {trend}
                        </div>
                        <div className="text-sm text-blue-600">
                          Last 10 avg: {avgRecent.toFixed(1)}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Channel Performance */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h3 className="font-medium text-green-800 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Channel Performance
                </h3>
                <div className="space-y-2">
                  {(() => {
                    const channelStats = data.items
                      .filter(r => r.rating)
                      .reduce((acc, r) => {
                        const channel = r.channel || 'unknown';
                        if (!acc[channel]) acc[channel] = { total: 0, count: 0 };
                        acc[channel].total += r.rating || 0;
                        acc[channel].count += 1;
                        return acc;
                      }, {} as Record<string, { total: number; count: number }>);
                    
                    const bestChannel = Object.entries(channelStats)
                      .map(([channel, stats]) => ({ channel, avg: stats.total / stats.count }))
                      .sort((a, b) => b.avg - a.avg)[0];
                    
                    return bestChannel ? (
                      <div className="text-sm text-green-700">
                        Best: {bestChannel.channel} ({bestChannel.avg.toFixed(1)} avg)
                      </div>
                    ) : (
                      <div className="text-sm text-green-600">No data available</div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
              <select
                value={sourceParam}
                onChange={(e) => updateFilter('source', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="hostaway">Hostaway</option>
                <option value="google">Google</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property</label>
              <select
                value={listingMapId || ''}
                onChange={(e) => updateFilter('listingMapId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">All Properties</option>
                {listings.map((listing) => (
                  <option key={listing.slug} value={listing.hostawayMapId || ''}>
                    {listing.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={approvedParam}
                onChange={(e) => updateFilter('approved', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="all">All</option>
                <option value="true">Approved</option>
                <option value="false">Unapproved</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Channel</label>
              <select
                value={channelParam}
                onChange={(e) => updateFilter('channel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">All Channels</option>
                <option value="airbnb">Airbnb</option>
                <option value="booking">Booking.com</option>
                <option value="vrbo">Vrbo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortParam}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="date_desc">Newest First</option>
                <option value="date_asc">Oldest First</option>
                <option value="rating_desc">Highest Rating</option>
                <option value="rating_asc">Lowest Rating</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Table */}
        {data && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Reviews ({data.total.toLocaleString()})
                </h2>
                
                {/* Bulk Operations */}
                {selectedReviews.size > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">
                      {selectedReviews.size} selected
                    </span>
                    <button
                      onClick={() => bulkApprove(true)}
                      disabled={bulkLoading}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      {bulkLoading ? 'Updating...' : 'Approve All'}
                    </button>
                    <button
                      onClick={() => bulkApprove(false)}
                      disabled={bulkLoading}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      {bulkLoading ? 'Updating...' : 'Unapprove All'}
                    </button>
                    <button
                      onClick={() => setSelectedReviews(new Set())}
                      className="px-3 py-1 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {data.items.length === 0 ? (
              <div className="p-12 text-center">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
                <p className="text-gray-600">Try adjusting your filters to see more results.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedReviews.size === data.items.length && data.items.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Source
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rating
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Review
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Author
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.items.map((review) => (
                      <tr key={review.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedReviews.has(review.id)}
                            onChange={() => toggleSelectReview(review.id)}
                            className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDateUTC(review.submittedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            review.source === 'google' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {review.source}
                          </span>
                          {review.channel && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {review.channel}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {review.rating ? (
                            <StarRating value={review.rating} />
                          ) : (
                            <span className="text-gray-400 text-sm">No rating</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900 line-clamp-2 max-w-xs">
                            {review.text}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {review.authorName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-3">
                            <ApproveToggle
                              id={review.id}
                              approved={review.approved}
                              onChange={(approved: boolean) => {
                                setData(prev => prev ? {
                                  ...prev,
                                  items: prev.items.map(item => 
                                    item.id === review.id ? { ...item, approved } : item
                                  )
                                } : null);
                              }}
                            />
                            <PinToggle
                              id={review.id}
                              pinned={review.pinned}
                              onChange={(pinned: boolean) => {
                                setData(prev => prev ? {
                                  ...prev,
                                  items: prev.items.map(item => 
                                    item.id === review.id ? { ...item, pinned } : item
                                  )
                                } : null);
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {data && data.total > limitParam && (
          <div className="mt-8 flex items-center justify-between bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{offsetParam + 1}</span> to{' '}
              <span className="font-medium">{Math.min(offsetParam + limitParam, data.total)}</span> of{' '}
              <span className="font-medium">{data.total.toLocaleString()}</span> reviews
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set('offset', String(Math.max(0, offsetParam - limitParam)));
                  router.push(`/dashboard?${params.toString()}`);
                }}
                disabled={offsetParam <= 0}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.set('offset', String(offsetParam + limitParam));
                  router.push(`/dashboard?${params.toString()}`);
                }}
                disabled={offsetParam + limitParam >= data.total}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
