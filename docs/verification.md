# Verification — November 17, 2026

- Production build, ESLint, and TypeScript checks passed.
- All 11 source routes rendered at desktop and mobile widths without horizontal overflow.
- External website links use a new tab and both noopener/noreferrer attributes.
- Desktop services dropdown, sticky header, back-to-top control, mobile menu, and mobile services submenu checked.
- Mobile navigation selects the requested route and resets the menu.
- Source screenshot comparison: header pixels matched exactly at desktop and mobile sizes. Across the first viewport, 98.88% of desktop pixels and 98.64% of mobile pixels differ by no more than 5 levels per color channel (0–255); the scrollbar is excluded. These are visual similarity measurements, not a claim of 100% pixel equality throughout the site.
- All local images loaded. The source contact page has one missing legacy logo URL; its 404/reference is preserved.
- Existing service example destinations were checked earlier and returned HTTP 200.
- No contact inquiry was sent. The form opens an email draft rather than posting to the existing WordPress backend.
- The live WordPress site and domains were not changed. The recreation is submitted on a dedicated GitHub review branch.

The screenshots in this folder show the recreated site. The original site is https://venezialandsurvey.com/.
