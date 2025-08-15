"use client";
import React from "react";

export function StarRating({ value, outOf = 5 }: { value: number | null | undefined; outOf?: number }) {
  const v = typeof value === "number" ? Math.max(0, Math.min(outOf, value)) : 0;
  const full = Math.floor(v);
  const half = v - full >= 0.5;
  const empty = outOf - full - (half ? 1 : 0);
  return (
    <div className="inline-flex items-center gap-0.5" aria-label={`${v} out of ${outOf} stars`}>
      {Array.from({ length: full }).map((_, i) => (
        <svg key={`f${i}`} className="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.803 2.037a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.803-2.037a1 1 0 00-1.176 0l-2.803 2.037c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.88 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
      ))}
      {half && (
        <svg className="h-4 w-4 text-yellow-500" viewBox="0 0 24 24" aria-hidden="true">
          <defs>
            <linearGradient id="half">
              <stop offset="50%" stopColor="currentColor"/>
              <stop offset="50%" stopColor="transparent"/>
            </linearGradient>
          </defs>
          <path fill="url(#half)" d="M12 .587l3.668 7.431L24 9.75l-6 5.848L19.335 24 12 19.897 4.665 24 6 15.598 0 9.75l8.332-1.732z"/>
        </svg>
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <svg key={`e${i}`} className="h-4 w-4 text-gray-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.803 2.037a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.803-2.037a1 1 0 00-1.176 0l-2.803 2.037c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.88 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
      ))}
    </div>
  );
}
