# Care Visit Brief — adversarial review 2 handoff

**Status:** review complete; product not accepted
**Live URL:** https://care-visit-brief.sociobot.in
**Date:** 2026-08-28

## What was done

- Performed the requested no-code adversarial review and wrote `.factory/review-2.md`.
- Used fresh mobile and desktop live browser contexts, a fresh temporary clone, and local source inspection. No product source or assets were changed.
- Read the prior review, polish document, and handoff; rechecked all F-1-1 through F-1-25 rather than accepting their “fixed” labels.

## Verification

- Every one of the 19 registered claim commands passed individually in the clean clone. This includes `LIVE_CLAIM=1` for `live-deployment`.
- The full local suite passed 40 tests with one intentional deployment-only skip. Production build output was created successfully.
- Fresh live checks confirm a clear cold first read, one-click populated demo, reset/exit isolation, same-origin demo requests, route metadata, link crawl, real 404, and zero Axe WCAG 2 A/AA violations on seven routes.
- Live Back navigation after an in-app route change loses the original landing scroll position. The source has no history scroll-state handling.

## Known gap / next step

**Blocking F-2-1:** implement saved scroll position for SPA Back and Forward, while retaining the current destination-heading focus. Add a regression test for scroll position plus focus, redeploy, and repeat this full review.
