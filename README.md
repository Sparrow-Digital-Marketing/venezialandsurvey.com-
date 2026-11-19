# Venezia & Associates — faithful site recreation

Next.js App Router and TypeScript recreation of the current public site at https://venezialandsurvey.com/. This version replaces the earlier modern design draft and retains the original layout, text, logo, colors, imagery, typography, service pages, and survey-example destinations.

## Run locally

Use Node.js 22.9 or later.

```sh
npm ci
npm run dev
```

```sh
npm run lint
npm run typecheck
npm run build
npm start
```

## Structure

- `source/replica/` — sanitized, captured page content and an original-to-local asset map.
- `public/source-assets/` — local copies of the source site's styles, fonts, and images.
- `app/[[...segments]]/page.tsx` — statically generated routes for the home, about, services, contact, and seven service URLs, including the existing facility-lines alias.
- `components/replica-interactions.tsx` — lightweight replacements for the original theme's mobile navigation, responsive typography, sticky header, reveal effects, parallax backgrounds, and back-to-top action.
- `app/replica.css` — responsive recreation of the original hero and behavior styles.
- `scripts/` — source capture, asset localization, and screenshot comparison utilities. These scripts are not run during the production build.

The original WordPress, Revolution Slider, analytics, and contact-form scripts are not executed. Original HTML is a captured build artifact, sanitized by the capture script; it is not fetched from WordPress at runtime. Source assets are retained to reproduce the original appearance. External website links open in a new tab with `rel="noopener noreferrer"`; internal navigation stays within the recreation.

## Contact behavior and launch status

The contact form matches the original visible fields and posts to `/api/contact`. Configure server-only `RESEND_API_KEY`, `CONTACT_FROM_EMAIL` (on a verified Resend domain), and `CONTACT_TO_EMAIL` in Vercel. The temporary recipient defaults to ray@sparrowdigitalmarketing.com; update it at launch. Validation and provider failures preserve the visitor's message and never report success. The hidden spam trap is excluded from the visible form. Delivery remains unavailable until valid provider settings are configured; no real test email has been sent.

The original contact page references an old logo that currently returns HTTP 404; the same reference is retained rather than inventing an asset. Original copy, including legacy dates and placeholder numbers on service pages, is preserved for fidelity.

This local draft blocks indexing through `app/robots.ts` and root metadata. Remove those protections, set the final domain and canonical URLs, and add a sitemap only when production launch is approved. This work does not change the live WordPress site.

## Review

Compare the source and recreation at identical viewport widths and scroll positions after fonts and images load. Check the desktop and mobile menus, service dropdowns, sticky header, page navigation, form labels and required fields, PDF/example links, and back-to-top action. Source animations can show intermediate states; compare their settled appearance. The custom hero reproduces the settled source state rather than loading the legacy slider runtime.
