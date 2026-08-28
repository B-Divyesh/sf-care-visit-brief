# Independent verification 4 — FAIL

**Candidate:** `8a34d55a42f03fbf9f7755e42b84c08d937a6907`  
**Live URL:** <https://care-visit-brief.sociobot.in>  
**Verified:** 2026-08-28, clean checkout

## Release decision

**FAIL.** The sample sandbox writes a verified license and the personal cover
note into the real, un-namespaced local-storage namespace. That data survives
**Start for real** and is immediately shown in the real log. This violates the
demo-sandbox acceptance requirement that nothing done in demo is saved to real
data and that demo storage use a separate namespace.

## First read (cold live page)

PASS. The cold first screen says it makes a visit history clear, names people
whose symptoms change between appointments, and says the result is a short
record to hand to a clinician. The visible first action is **Try it with sample
data**, with the adjacent explanation “See a finished visit history right
away.” It also shows the three required plain facts: stays on device, works
offline after the first visit, and price/core-free status.

## Required claims — clean clone and demo entry

`npm ci` installed 23 packages with zero audit vulnerabilities. Each exact
command from `.factory/claims.json` was run from the clean checkout:

| Claim | Exact command | Result |
| --- | --- | --- |
| CSV export | `npm test -- --grep @claim:csv-export` | PASS |
| Offline reload | `npm test -- --grep @claim:offline-reload` | PASS |
| Device-only | `npm test -- --grep @claim:device-only` | PASS |
| Encrypted backup | `npm test -- --grep @claim:encrypted-backup` | PASS on retry |
| Printable brief | `npm test -- --grep @claim:print-brief` | PASS |
| JSON backup | `npm test -- --grep @claim:json-backup` | PASS |
| Paid unlock | `npm test -- --grep @claim:paid-unlock` | PASS |

The first encrypted-backup command attempt failed before test execution with
`page.goto: net::ERR_CONNECTION_REFUSED` for `127.0.0.1:4173/demo`; the
immediate clean standalone retry passed (1/1), as did the complete suite. This
is recorded as a test-harness reliability observation, not the basis for the
decision. The tagged paid-unlock test is now entered through `/demo`.

## Defects

### High — demo actions leak into real storage

Reproduction against the live deployment, in a fresh browser context:

1. Open `/demo?license=<valid-license>` (the verification response was
   fulfilled with a valid recorded response, so no production license was
   consumed).
2. Enter `Sample-mode note must not reach real mode.` in **Personal cover
   note**.
3. Select **Start for real**.

While the demo banner is present, the app writes these global keys:

```text
sb_license:care-visit-brief
sb_license_verdict:care-visit-brief
care-visit-brief:cover-note
```

After Start for real, all three remain. The real `/log` shows the cover-note
control with the exact sample-mode note prefilled. Only IndexedDB entries use
`demo:entries`; the license and cover note do not. The claim test checks that
`real:entries` is absent, but it does not check these real local-storage keys.

**Required fix:** namespace license/verdict/cover-note state for demo (or keep
it entirely in memory), clear it when leaving demo, and extend the tagged
paid-unlock claim test to assert no non-demo state is read or written. Re-run
the full clean claim matrix after fixing.

### Low — one claim invocation was flaky

As noted above, the first exact encrypted-backup invocation found no server at
the configured Playwright base URL. A retry and the 26-test suite passed. The
release is already blocked by the high-severity product defect, but the test
server lifecycle should be made deterministic because the contract treats a
failed claim test as blocking.

## Functional, boundary, and recovery evidence

- `npm test`: **PASS, 26/26** after `tsc -b` and the production Vite build.
  There is no lint script; TypeScript checking is part of `npm run build`.
- `npm run build`: **PASS** and produced `dist/`.
- `npm run test:live`: **PASS**. It SHA-256-compared both live executable
  assets with `dist`, checked immutable assets/no-store worker, product catalog
  price/return URL, HTTPS checkout redirect, and invalid-token rejection.
- Normal real-log flow independently saved a severity/note entry and retained
  it in the timeline (`Today’s note saved.`). The suite additionally covers
  optional/custom tags, severity boundaries 0 and 4, two-tab merging, undo,
  CSV formula neutralization, print output, encrypted and legacy backup
  restore, corrupt-store recovery, and future-date rejection.
- Direct live demo recovery checks rejected a short backup password with the
  actionable 12-character message and rejected malformed backup input while
  retaining existing data.
- No diagnosis or treatment recommendation is made; privacy and terms routes
  state the local-first limitation and medical disclaimer.

## Accessibility, responsive, and policy evidence

- Independent live Axe WCAG 2 A/AA scans of `/`, `/log`, `/demo`, `/privacy`,
  `/terms`, and `/missing-page` found **0 serious or critical** violations.
  Each has `lang="en"`, exactly one `h1`, one `main`, and a route-specific
  descriptive title.
- Normal live routes had no console or page errors. The not-found navigation
  correctly returns HTTP 404 and consequently creates the expected browser
  failed-resource console message.
- At 390px: no horizontal overflow (`scrollWidth = clientWidth = 390`), the
  primary button was 354x48px, the encrypted-backup summary 318x44px, and Tab
  first focused the skip link with a visible `rgb(30,43,59) solid 3px` ring.
- With reduced motion, entry animation and transition durations were `0.00001s`.
- Fresh-context PWA test passed: after visiting `/demo`, worker readiness and
  browser HTTP-cache clearing, a new offline `/demo` tab loaded HTTP 200 with
  the demo banner and the Aug 23 sample entry.
- Cold demo/network capture made no cross-origin requests. Source and live
  policy inspection found no analytics, CDN scripts/fonts, raw Azure calls, or
  sign-in; Entra verification is not applicable. The explicit Sociobot
  license endpoint is the only allowed external runtime destination.
- Live headers: HSTS, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, and a self-only CSP with
  only `https://api.sociobot.in` in `connect-src`. JS/CSS/hero are immutable
  one-year cache entries; `sw.js` is `no-cache, no-store`; an unknown route is
  a styled HTTP 404.
- Build sizes: JS 27.52 KB raw / 10.01 KB gzip; CSS 10.86 KB raw / 3.27 KB
  gzip; hero WebP 50.64 KB. They are below the supplied static/PWA budgets.

## Server endpoint rate limit

An 80-request concurrent burst to the non-mutating invalid-license
verification URL returned **30 × HTTP 200**, then **50 × HTTP 429**, every 429
with **`Retry-After: 4`**. Observed burst allowance: 30 requests. Checkout is
live and redirects HTTP 303 to HTTPS Dodo checkout; no payment was attempted.

## Scope notes

This is a static local-first PWA, not a backend, library, or CLI. Consumer
package and persistence-boundary/health-endpoint tests are not applicable.
No product code was modified during verification.
