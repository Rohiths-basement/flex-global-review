"use client";
import { useState, useEffect } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import Link from "next/link";

interface Settings {
  hostawayApiKey: string;
  googlePlacesApiKey: string;
  autoApproveThreshold: number;
  emailNotifications: boolean;
  bulkOperationsEnabled: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    hostawayApiKey: "",
    googlePlacesApiKey: "",
    autoApproveThreshold: 4.5,
    emailNotifications: true,
    bulkOperationsEnabled: true,
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load settings from localStorage (in production, this would come from API)
    const savedSettings = localStorage.getItem('flex-dashboard-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      // In production, this would save to API
      localStorage.setItem('flex-dashboard-settings', JSON.stringify(settings));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSettings({
      hostawayApiKey: "",
      googlePlacesApiKey: "",
      autoApproveThreshold: 4.5,
      emailNotifications: true,
      bulkOperationsEnabled: true,
    });
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-bg via-bg to-brand-700/5">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600">Configure your dashboard preferences and API keys</p>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Dashboard Configuration</h2>
            </div>

            <div className="p-6 space-y-8">
              {/* API Keys Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">API Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hostaway API Key
                    </label>
                    <input
                      type="password"
                      value={settings.hostawayApiKey}
                      onChange={(e) => setSettings(prev => ({ ...prev, hostawayApiKey: e.target.value }))}
                      placeholder="Enter your Hostaway API key"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Required for fetching reviews from Hostaway properties
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Google Places API Key
                    </label>
                    <input
                      type="password"
                      value={settings.googlePlacesApiKey}
                      onChange={(e) => setSettings(prev => ({ ...prev, googlePlacesApiKey: e.target.value }))}
                      placeholder="Enter your Google Places API key"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Required for fetching Google reviews and place data
                    </p>
                  </div>
                </div>
              </div>

              {/* Review Management Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Review Management</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Auto-approve threshold (rating)
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min="1"
                        max="5"
                        step="0.1"
                        value={settings.autoApproveThreshold}
                        onChange={(e) => setSettings(prev => ({ ...prev, autoApproveThreshold: parseFloat(e.target.value) }))}
                        className="flex-1"
                      />
                      <span className="text-sm font-medium text-gray-900 min-w-[3rem]">
                        {settings.autoApproveThreshold.toFixed(1)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Reviews with ratings above this threshold will be automatically approved
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="bulkOperations"
                      checked={settings.bulkOperationsEnabled}
                      onChange={(e) => setSettings(prev => ({ ...prev, bulkOperationsEnabled: e.target.checked }))}
                      className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    <label htmlFor="bulkOperations" className="text-sm font-medium text-gray-700">
                      Enable bulk operations
                    </label>
                  </div>
                </div>
              </div>

              {/* Notifications Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="emailNotifications"
                      checked={settings.emailNotifications}
                      onChange={(e) => setSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                      className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    <label htmlFor="emailNotifications" className="text-sm font-medium text-gray-700">
                      Email notifications for new reviews
                    </label>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Reset to Defaults
                </button>

                <div className="flex items-center space-x-3">
                  {saved && (
                    <span className="text-sm text-green-600 font-medium">
                      Settings saved successfully!
                    </span>
                  )}
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-6 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts Info */}
          <div className="mt-8 bg-white rounded-xl shadow-lg border border-slate-200/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Keyboard Shortcuts</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Dashboard Navigation</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Go to Dashboard</span>
                      <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl + D</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Go to Listings</span>
                      <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl + L</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Go to Settings</span>
                      <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl + ,</kbd>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Review Management</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Select All</span>
                      <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl + A</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bulk Approve</span>
                      <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl + Shift + A</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Clear Selection</span>
                      <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Escape</kbd>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
