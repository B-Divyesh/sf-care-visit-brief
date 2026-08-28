# Care Visit Brief — adversarial review 3 handoff

**Status:** review complete; **FAIL**

**Reviewed checkout:** `0efb1d1c84988c0462faadd8d161dff2e9a62dd1`

**Live URL:** <https://care-visit-brief.sociobot.in>

**Date:** 2026-08-28

## What was done

Completed a cold mobile and desktop first-read review, full landing and README
copy audit, one-click demo and storage-isolation exercise, live offline and
request-log check, claim matrix, route/link/metadata crawl, Axe scan,
Back/Forward focus and scroll test, visual-identity check, and cumulative audit
of reviews 1–2 and polish rounds 1–2.

The result is recorded in `.factory/review-3.md`. Product code was not changed.

## Verification

- Fresh temporary clone: `npm ci`, followed by every exact command in
  `.factory/claims.json`; all 19 passed independently.
- Current checkout: `npm test` passed **41 tests** with the intentional
  deployment-only test skipped; the build produced `dist/index.html`.
- Production claim: `LIVE_CLAIM=1 npm test -- --grep
  @claim:live-deployment` passed and matched deployed assets to the local
  build.
- Live routes: six expected 200 routes and one designed 404; zero Axe WCAG 2
  A/AA violations; no normal-route console or page errors.
- Live demo: five notes visible in the first 390 × 844 viewport; Reset restored
  five; exit removed demo storage and preserved a seeded real note.
- Live offline: after warming the service worker and clearing HTTP cache, a new
  offline tab loaded the demo banner and sample note. All observed demo-flow
  requests were same-origin.
- Live history: Back restored y=320 on `/log` and y=900 on `/`; Forward
  restored y=320 on `/log`, with the route h1 focused each time.

## Findings left

- Blocking: F-1-22 is reopened because earlier quoted README jargon remains.
- Minor: F-3-1 through F-3-5 cover two vague landing headings, one generic
  caption, one contextless README heading, and the metaphorical 404 h1.

The product behavior and all registered claims pass. The remaining work is
copy-only, but this review standard requires zero findings for PASS.
