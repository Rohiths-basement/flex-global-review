# Flex Living Reviews Dashboard

This project implements a manager dashboard and public property reviews display for Flex Living.

- Tech: Next.js App Router (14/15 line), TypeScript, Tailwind with brand tokens, Prisma + SQLite, Zod, Recharts.
- Sources: Hostaway (sandbox with mock fallback) and Google Places (optional, capped to 5, 30-day cache).
- Data: Normalized review shape across sources; approvals/pins stored in DB.

## Local Setup

1) Install deps and set env
- Node 18+
- Copy `.env.local.example` to `.env.local` and fill:
  - HOSTAWAY_ACCOUNT_ID=61148
  - HOSTAWAY_CLIENT_ID=...
  - HOSTAWAY_CLIENT_SECRET=...
  - GOOGLE_PLACES_API_KEY=...

2) DB
- `npm run prisma:migrate`
- `npm run prisma:seed` (optional; seeds listings)

3) Run
- `npm run dev`
- Visit `/dashboard`

## Normalization

All reviews are normalized to a common shape:
- id: `${source}:${sourceReviewId}` (e.g., `hostaway:7453`)
- source: `hostaway | google`
- channel (Hostaway): `airbnb | booking | vrbo | hostaway`
- type (Hostaway): `guest-to-host | host-to-guest`
- rating: 0–5 (Hostaway raw 0–10 avg mapped to 0–5; `ratingRaw` preserved)
- categories (Hostaway): map of 0–10 per category
- submittedAt: ISO UTC (`YYYY-MM-DDTHH:mm:ss.sssZ`)
- listing: `{ listingMapId, name }` (Hostaway only)
- text, authorName

## API Endpoints

### GET /api/reviews/hostaway
Normalized Hostaway reviews with mock fallback and DB overlay of approvals/pins.

Query params:
- listingMapId?: number
- from?: YYYY-MM-DD (inclusive)
- to?: YYYY-MM-DD (inclusive)
- ratingMin?: number (0–5)
- ratingMax?: number (0–5)
- channel?: airbnb|booking|vrbo|hostaway
- type?: guest-to-host|host-to-guest
- approved?: boolean
- pinned?: boolean
- limit?: number (default 50)
- offset?: number (default 0)
- sort?: date_desc|date_asc|rating_desc|rating_asc|channel_az|channel_za
- categoryName?: string (e.g., cleanliness, communication, respect_house_rules)
- categoryMin?: number (0–10)

Response:
```
{ status: "success", count: number, result: Review[] }
```
`count` is computed after filters on the current set of items returned from the source. The source may have its own pagination window.

### GET /api/reviews/google
Normalized Google reviews. Includes attribution; caches up to 30 days in `ReviewCache`.

Query params:
- placeId?: string
- listingSlug?: string (maps to a Place ID via DB if configured)
- from?, to?, ratingMin?, ratingMax?, approved?, pinned?, limit?, offset?, sort? (same semantics as Hostaway; channel is fixed as `google`)

Response:
```
{ status: "success", place: {...}, attribution: {...}, count: number, result: Review[] }
```

### PATCH /api/reviews/[id]
Toggle approval/pinned for a review; persists to Prisma `Review` table.

Body (partial):
```
{ approved?: boolean, pinned?: boolean }
```

### GET /api/listings/[slug]
Returns listing meta and approved reviews ordered pinned first, then newest.

Response:
```
{ listing, reviews }
```

## Dashboard (/dashboard)

- Dynamic listings from DB; choose source (Hostaway/Google).
- Filters: listing, approval, pinned, channel (Hostaway), type (Hostaway), rating range (0–5), date range, category (name + min 0–10, Hostaway), sort (date/rating/channel), pagination (limit/offset).
- KPIs: total, approved, pinned, avg rating. Trend sparkline of review volume.
- Table with Approve/Pin toggles (accessible with `role="switch"`, `aria-checked`).

Accessibility:
- All filter labels associated via `htmlFor`/`id`.
- Toggles use ARIA switch roles.

## Google Integration Notes
- Reviews capped to 5 per Places API; cached for <=30 days. Attribution displayed where applicable.
- Provide a `listingSlug` → `placeId` mapping in DB as needed.

## Limitations & Future Work
- Hostaway `count` reflects current window after filters; not a global post-filter count.
- Tests (Vitest/RTL/Playwright) recommended: normalization, API filters, sparkline.
- Additional sort fields, richer charts, export CSV.

## Integration: theflex.global

You can integrate approved reviews into the main marketing site in three ways:

### 1) Drop-in Embed (recommended)

- Include a container and load the public script. The script injects an iframe and auto-resizes to fit content.

```
<div data-flex-reviews data-slug="{listing-slug}" data-limit="6"></div>
<script async src="https://{your-reviews-app-domain}/embed.js"></script>
```

Options via data attributes on the container:
- `data-slug` (required): listing slug in Reviews DB
- `data-limit` (optional): 1–24 reviews to show
- `data-origin` (optional): base URL of the reviews app (auto-detected from script src)
- `data-min-height` (optional): initial height before first resize (px)

Direct iframe (if you prefer managing element creation yourself):

```
<iframe
  src="https://{your-reviews-app-domain}/embed/reviews/{listing-slug}?limit=6"
  title="Flex Reviews"
  loading="lazy"
  style="width:100%;border:0;display:block;min-height:200px"
></iframe>
```

Notes:
- Google attribution appears automatically when Google reviews are present.
- The embed uses app branding. Because it is sandboxed in an iframe, it will not affect host styles.

### 2) SEO Structured Data (JSON-LD)

- Server-side fetch the JSON-LD for a listing and inline it in the page `<head>`.

Endpoint:
```
GET /api/seo/reviews/{slug}
Content-Type: application/ld+json
```

Example (Next.js):
```ts
// inside getStaticProps/getServerSideProps
const res = await fetch(`https://{your-reviews-app-domain}/api/seo/reviews/${slug}`);
const jsonLd = await res.text();

// in component Head
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
```

### 3) Native JSON (render in host site)

Use the listings API to fetch approved reviews and render natively in the theflex.global codebase.

Endpoint:
```
GET /api/listings/{slug}
```

Response:
```
{ status: "success", result: { listing, reviews } }
```

### CORS

Public endpoints include permissive CORS with explicit allow for `theflex.global`.
- `/api/listings/[slug]` and `/api/seo/reviews/[slug]` handle `GET` and `OPTIONS` with appropriate CORS headers.

