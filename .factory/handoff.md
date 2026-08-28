# Care Visit Brief — polish round 3 handoff

**Status:** PASS; no review finding remains open

**Reviewed candidate:** `0efb1d1c84988c0462faadd8d161dff2e9a62dd1`

**Review commit:** `5f6f8325d6ea6465c921a735104456a0670cf090`

**Deployed repair:** `091d2f19b919919323c182453f4f118c82e35824`

**Deployment ID:** `a81cf1b5-7fd3-4759-b341-40cfba335a41`

**Live URL:** <https://care-visit-brief.sociobot.in>
**Date:** 2026-08-28

## What changed

- Rewrote every remaining round-3 phrase in plain, specific language: the two
  How it works headings, hero caption, README usage heading and deployment
  check, and the 404 h1/recovery copy.
- Removed related terminology remnants from demo/404 metadata and the offline
  fallback. “Notebook” now appears only where it literally describes the
  generated image or records the visual thesis.
- Aligned `live-deployment` in `.factory/claims.json` with the concrete README
  outcomes. Its live verifier now asserts CSP, `nosniff`, referrer policy,
  HSTS, price, route titles/URLs, HTTP 404, and built-file hashes.
- Added a browser regression for all reviewed phrases and the 70-character,
  verb-first catalog description.
- Made `@claim:blank-days` wait for all five seeded demo notes before adding
  its two dated notes. This removes a pre-existing timing race without
  weakening the claim.
- Preserved the warm paper, blue-black ink, oxide rule, clipped-note shapes,
  serif headings, and original still-life asset. The artifact remains a Vite
  TypeScript offline PWA with IndexedDB storage.

The complete finding-by-finding matrix is in `.factory/polish-3.md`.

## How it was verified

### Clean-clone claims and full suite

A fresh clone of `091d2f1` at `/tmp/cvb-polish3-clean-091d2f1` ran `npm ci`
with zero reported vulnerabilities. It then ran each of the 18 local commands
from `.factory/claims.json` separately; all passed. After deployment, the same
clone ran the 19th command:

```sh
LIVE_CLAIM=1 npm test -- --grep @claim:live-deployment
```

It passed and reported that the live release checks passed. The clean clone's
complete suite reported **42 passed, one deployment-only skip**. The work
order's exact build command also passed:

```sh
npm ci && npm test && npm run build
```

The final build created `dist/index.html`. Initial JS is 32.58 KB raw / 11.53
KB gzip. CSS is 11.61 KB raw / 3.38 KB gzip. The live Lighthouse transfer was
116,872 bytes.

### Browser, accessibility, privacy, and offline

- Local URL verifier: `.factory/polish-3/local-verify/verify.json`, 549 ms,
  zero errors, one h1, one main, `lang=en`, no missing alt text, and no unnamed
  buttons.
- Live URL verifier: `.factory/polish-3/live-verify/verify.json`, 1,484 ms,
  with the same clean result.
- Axe WCAG 2 A/AA found zero serious or critical violations on `/`, `/log`,
  `/?demo=1`, `/demo`, `/privacy`, `/terms`, and `/missing-page`.
- At 390 × 844, all 42 visible interactive targets on `/log` measured at least
  44 × 44 px and the page had no horizontal overflow.
- The landing facts end at 721 px. One click opens `/?demo=1`; the realistic
  sample ends at 611.8 px and all five sample notes are present.
- A cold live isolation run saved `REAL LIVE ROUND 3 NOTE`, changed and reset
  the demo, then exited. The real note remained, `demo:entries` was absent,
  and no `demo:` localStorage keys remained.
- The normal landing/demo flow contacted only the product origin. The license
  request boundary is separately enforced by `@claim:license-data-boundary`.
- Back restored `/log` to 320 px and `/` to 900 px. Forward restored `/log` to
  320 px. The destination h1 held focus each time.
- After warming the live worker and clearing HTTP cache, a new offline tab
  opened `/?demo=1` with the demo banner and sample note.
- The live unknown route returned HTTP 404 with “We could not find this page,”
  the shared header/footer, route metadata, favicon, Privacy, and Terms.

The structured result is `.factory/polish-3/live-audit.json`. Cold mobile
screenshots are `live-landing-mobile.png`, `live-demo-mobile.png`,
`live-landing-full-mobile.png`, and `live-404-mobile.png` in that directory.

### Performance

| Target | Performance | Accessibility | Best Practices | SEO | LCP | CLS |
|---|---:|---:|---:|---:|---:|---:|
| Local production build | 100 | 100 | 100 | 100 | 1.508 s | 0 |
| Cold live release | 100 | 100 | 100 | 100 | 1.282 s | 0 |

Reports: `.factory/polish-3/local-lighthouse.json` and
`.factory/polish-3/live-lighthouse.json`.

## Deploy

The static work-order deploy uploaded `dist/` to the existing Azure Static Web
App and completed successfully. The custom HTTPS domain returned 200. No
backend, billing configuration, or product class was changed.

## Known gaps and next steps

None. All findings from reviews 1, 2, and 3 are fixed and rechecked on the live
site. No TODO or deferred minor item remains.
