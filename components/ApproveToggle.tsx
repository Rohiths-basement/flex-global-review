"use client";
import React from "react";

export function ApproveToggle({
  id,
  approved,
  listingSlug,
  onChange,
  payload,
}: {
  id: string;
  approved: boolean;
  listingSlug?: string;
  onChange?: (next: boolean) => void;
  payload?: Partial<{
    source: string;
    channel?: string;
    type?: string;
    rating?: number | null;
    ratingRaw?: number | null;
    categories?: unknown;
    text?: string;
    languageCode?: string;
    authorName?: string;
    submittedAt?: string;
  }>;
}) {
  const [busy, setBusy] = React.useState(false);
  const [state, setState] = React.useState(approved);

  async function toggle() {
    const next = !state;
    setState(next);
    setBusy(true);
    try {
      const res = await fetch(`/api/reviews/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: next, listingSlug, ...(payload || {}) }),
      });
      if (!res.ok) throw new Error(await res.text());
      onChange?.(next);
    } catch (e) {
      // rollback
      setState(!next);
      console.error(e);
      alert("Failed to update approval");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`inline-flex items-center rounded-lg px-3 py-1 text-sm border ${
        state ? "bg-brand-700 text-white border-brand-700" : "bg-surface text-text-primary border-divider"
      }`}
      role="switch"
      aria-checked={state}
      aria-label={state ? "Approved" : "Approve"}
    >
      {busy ? "Saving..." : state ? "Approved" : "Approve"}
    </button>
  );
}
