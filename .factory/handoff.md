# Care Visit Brief — polish round 2 handoff

**Status:** deployed and accepted
**Repair commit:** `9f5b7af`
**Live URL:** <https://care-visit-brief.sociobot.in>
**Date:** 2026-08-28

## What changed

Fixed F-2-1, the sole unresolved cumulative review finding. In-app navigation
now saves the outgoing route's scroll coordinates in its history entry.
Back/Forward renders the destination, focuses its one h1 without moving it,
then restores the saved scroll position. Browser automatic history restoration
is disabled so it cannot race that sequence. The repair includes a mobile
Playwright regression for Back and Forward focus and scroll restoration.

All F-1-1 through F-1-25 closures were retained and retested. The product
still provides the isolated `?demo=1` sample, one-page print path, local-first
storage, export/backup, route metadata, legal routes, real 404, and the
handwritten-notebook visual identity.

## Verification

- Fresh clone (`9f5b7af`): `npm ci`; all 18 local claim commands from
  `.factory/claims.json` passed separately; `npm test` passed **41 tests**.
  The deployment-only claim is intentionally skipped in that ordinary suite.
- After production deploy, the exact final claim command passed from that
  clean clone: `LIVE_CLAIM=1 npm test -- --grep @claim:live-deployment`.
- `npm run build` passed and produced `dist/index.html`. The shipped JS is
  32.52 KB raw / 11.52 KB gzip; CSS is 11.61 KB raw / 3.38 KB gzip; the hero
  image remains 50 KB.
- Local regression passed: `npm test -- --grep "browser Back and Forward
  restore each route scroll position and heading focus" --workers=1`.
- Cold production verifier: `.factory/polish-2/live-verify/verify.json`:
  1.208 s load, no console errors, `lang=en`, one h1, one main, zero missing
  image alt values, and zero unnamed buttons.
- Cold production audit: `.factory/polish-2/live-audit.json`: `/`, `/log`,
  `/?demo=1`, `/demo`, `/privacy`, and `/terms` returned 200; `/missing-page`
  returned 404. All seven routes had zero serious/critical Axe WCAG 2 A/AA
  violations. The demo sample ended at 612 px in an 844 px viewport; offline
  demo reload passed; Back restored 320 px on the timeline and 900 px on the
  landing page; Forward restored 320 px on the timeline, with the correct h1
  focused each time.

## Run and deploy

```sh
npm ci
npm test
npm run build
/opt/fleet/lib/deploy-static.sh care-visit-brief dist
LIVE_CLAIM=1 npm test -- --grep @claim:live-deployment
```

## Known gaps

None.
