"use client";
import React from "react";

export function PinToggle({
  id,
  pinned,
  listingSlug,
  onChange,
}: {
  id: string;
  pinned: boolean;
  listingSlug?: string;
  onChange?: (next: boolean) => void;
}) {
  const [busy, setBusy] = React.useState(false);
  const [state, setState] = React.useState(pinned);

  async function toggle() {
    const next = !state;
    setState(next);
    setBusy(true);
    try {
      const res = await fetch(`/api/reviews/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinned: next, listingSlug }),
      });
      if (!res.ok) throw new Error(await res.text());
      onChange?.(next);
    } catch (e) {
      setState(!next);
      console.error(e);
      alert("Failed to update pin state");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`inline-flex items-center rounded-lg px-3 py-1 text-sm border ${
        state ? "bg-yellow-100 text-yellow-800 border-yellow-300" : "bg-surface text-text-primary border-divider"
      }`}
      role="switch"
      aria-checked={state}
      aria-label={state ? "Pinned" : "Pin"}
      title={state ? "Pinned" : "Pin"}
    >
      {busy ? "Saving..." : state ? "Pinned" : "Pin"}
    </button>
  );
}
