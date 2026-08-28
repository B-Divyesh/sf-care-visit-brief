# Care Visit Brief — polish round 1 handoff

**Status:** complete  
**Live URL:** https://care-visit-brief.sociobot.in  
**Date:** 2026-08-28

## What changed

- Made `/?demo=1` the one-click canonical demo and placed a realistic sample note in the first mobile viewport.
- Kept demo notes, license state, and cover note in `demo:` storage. Reset and exit leave the real timeline unchanged.
- Rebuilt the print view as a compact one-page A4 visit brief. Long selected ranges now ask for a shorter range instead of silently making a second page.
- Expanded `.factory/claims.json` from seven partial claims to 19 complete contracts. Each has exactly one tagged test.
- Added recorded product and license fixtures for price, one-time purchase, merchant, restore, privacy, and refund-revocation behavior.
- Added route-specific canonical, Open Graph, Twitter, title, and description updates. Browser history restores heading focus and metadata.
- Rebuilt the true HTTP 404 with the shared header, footer, legal links, favicon, canonical, and social metadata.
- Standardized **note**, **timeline**, **visit brief**, and **medicine changes**. Rewrote the first screen, paid heading, actions, README, and legal copy.
- Preserved the handwritten lab-notebook identity. The new preview and print sheet use the existing paper, ink, oxide rule, serif type, and clipped-note grammar.
- Updated the catalog description to: “Turn daily symptom notes into a private, printable visit brief for your next appointment.”
- Tightened the controller-requested demo boundary: Reset demo and Start my private timeline now delete only `demo:entries`; the claim regression proves `REAL NOTE MUST REMAIN` survives both actions.

No runtime AI was added because note capture and exact printing must remain deterministic, private, and offline. No new generated image was needed; existing asset provenance remains in `.factory/design.md`.

## Verification

From a clean clone at the repair commit:

```sh
npm ci
npm test
```

- Full suite: 40 passed; one deployment-only test intentionally skipped until the live build exists.
- Controller regression: the exact 41-test single-worker suite completed with 40 passing tests and the intentionally skipped post-deploy claim. `@claim:demo-isolation` now checks the real record after reset and asserts that exit removes the `demo:entries` IndexedDB record.
- Every 18 non-live `.factory/claims.json` command: passed independently.
- Build: passed and produced `dist/index.html`.
- JS: 31.27 KB raw / 11.15 KB gzip.
- CSS: 11.61 KB raw / 3.38 KB gzip.
- Hero: 50 KB.
- Playwright Axe: zero serious or critical WCAG 2 A/AA violations on home, timeline, both demo URLs, Privacy, Terms, and unknown SPA route.
- Keyboard, focus, 44px mobile targets, undo, corrupt-data recovery, multi-tab merge, offline service worker, privacy request audit, and billing fixtures: passed.
- URL verifier: no console errors; one `h1`; `lang=en`; one main; no missing alt or unnamed buttons.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.36s; CLS 0.

Evidence:

- Finding map: `.factory/polish-1.md`
- First mobile demo: `.factory/polish-1/demo-mobile-first-screen.png`
- One-page PDF: `.factory/polish-1/sample-visit-brief.pdf`
- Local verifier: `.factory/polish-1/local-verify/verify.json`
- Local Lighthouse: `.factory/polish-1/local-lighthouse.json`
- Post-deploy verifier: `.factory/polish-1/live-verify/verify.json`
- Cold route and Axe audit: `.factory/polish-1/live-a11y.json`
- Cold isolation, focus, privacy, and offline audit: `.factory/polish-1/live-flow.json`

After deployment, the deployment-only claim is run from a second clean clone:

```sh
LIVE_CLAIM=1 npm test -- --grep @claim:live-deployment
```

Result: 1 passed from a new clone of pushed `main`. The script matched both live hashed assets to `dist/`, confirmed the production USD 12 catalog record, checked checkout and invalid-license behavior, and verified every route plus the real 404.

The final cold browser audit also passed. The live sample appears at 612px in the 844px viewport. Its PDF has one page. All five app/legal routes return 200, and `/missing-page` returns 404. All six pages have zero serious or critical Axe violations. Demo reset, exit isolation, browser Back focus, same-origin privacy, and offline reload passed.

## Deploy

```sh
npm ci
npm test
npm run build
/opt/fleet/lib/deploy-static.sh care-visit-brief dist
```

## Known gaps

None. All F-1-1 through F-1-25 findings are closed, deployed, and mapped in `.factory/polish-1.md`.
