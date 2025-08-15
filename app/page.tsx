import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-container mx-auto px-4 py-section">
      <h1 className="text-display-md font-semibold text-text-primary">Flex Living Reviews</h1>
      <p className="mt-2 text-text-secondary">Dashboard and public property pages</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/dashboard" className="inline-flex items-center rounded-lg bg-brand-700 px-6 py-2 text-white hover:opacity-90">Open Dashboard</Link>
        <Link href="/properties" className="inline-flex items-center rounded-lg bg-brand-600 px-6 py-2 text-white hover:opacity-90">Browse Properties</Link>
        <Link href="/properties/shoreditch-heights-a" className="inline-flex items-center rounded-lg border border-divider bg-surface px-6 py-2 text-text-primary hover:bg-bg">Sample: Shoreditch Heights A</Link>
        <Link href="/properties/camden-loft-b" className="inline-flex items-center rounded-lg border border-divider bg-surface px-6 py-2 text-text-primary hover:bg-bg">Sample: Camden Loft B</Link>
        <Link href="/properties/battersea-riverside-c" className="inline-flex items-center rounded-lg border border-divider bg-surface px-6 py-2 text-text-primary hover:bg-bg">Sample: Battersea Riverside C</Link>
      </div>
    </div>
  );
}
