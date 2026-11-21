# Fatlum Jewelry

Next.js (App Router, TypeScript, Tailwind v4) site for Fatlum rings and jewelry. German is the default (`/de`), English is `/en`. There is no checkout and no price on any page. Visitors add pieces or a ring configuration to a request list and send a form.

Temporary host: `https://top-orangered-kudu-52.hostingersite.com` (Hostinger Node.js, `npm run build` then `npm start`). Deploy from `main` when you are ready. This repository’s pull request is not merged on its own.

Sister sites, linked in the header and footer:

- Fatlum Gold — `https://honeydew-seahorse-267054.hostingersite.com`
- Fatlum Diamonds — `https://little-mistyrose-starling-03.hostingersite.com`

## Pages

- Home
- Collections: wedding rings, engagement rings, other rings, chains, earrings, pendants
- Product detail with “add to request list” and “request price”
- Ring configurator (single finished ring, wedding pair, or trade blank)
- Request list and contact form
- Guides: ring size, alloys, profiles, care
- FAQ, about, contact
- Imprint, privacy, terms (register, legal form and VAT ID are marked placeholders)

## Configurator

A lazy-loaded react-three-fiber model. Finished rings: yellow, white and rose gold in 585 and 750, platinum 950, diamond shape, carat (the stone scales), solitaire / halo / pavé, German size, inside engraving. Blanks: metal, width and size, without a stone. While the canvas loads, a studio photograph stands in. The enquiry stores the full configuration. No price, no payment.

## Photographs

Original studio photographs live in `public/images/jewelry/*.webp` (and `.avif`). Backgrounds are normalized to `#f7f4ef`. The map is `src/lib/image-slots.ts`. `next/image` serves AVIF or WebP with `sizes`. Dropping a replacement file at the same path is enough.

## Data

Migrations (apply them yourself; nothing here connects with a service role):

- `supabase/migrations/20261118180000_jewelry_schema.sql`
- `supabase/migrations/20261118180100_jewelry_seed.sql`

Every table is prefixed `jewelry_`. Row Level Security is on. Catalogue tables allow anonymous `select` of active rows. `jewelry_inquiries` and `jewelry_inquiry_items` allow anonymous `insert` only.

Gold tables (`products`, `order_requests`, `order_request_items`) are not touched.

## Environment

See `.env.example`.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` optional, unused by the storefront
- `RESEND_API_KEY` optional; when unset the request is stored and no email is sent
- `MAIL_FROM` (default `Fatlum Jewelry <anfragen@fatlum.jewelry>`)
- `MAIL_TO` (default `info@fatlum.jewelry`)

`SUPABASE_URL` and `SUPABASE_ANON_KEY` are accepted as aliases.

## Run

```bash
npm install
npm run dev
npm run build
npm start
```

Product photographs are original studio files in `public/images/jewelry`. The wordmark is the Fatlum mark shared with Fatlum Gold. No analytics, fonts are self-hosted.

No new database migration. Apply the two existing `jewelry_` migrations if they are not already on the project. Resend stays optional: without `RESEND_API_KEY` the enquiry is only stored.
