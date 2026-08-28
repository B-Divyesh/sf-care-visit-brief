# Independent verification 5 — PASS

**Candidate:** `15a1abeecd1770053a24490efcb417e3d9a5c31d` (`main`)
**Live URL:** https://care-visit-brief.sociobot.in
**Verified:** 2026-08-28 from a clean checkout

## Verdict

**PASS — release candidate accepted.** The fresh deployed executable matches the
fresh local production build. No deployment-only failure was reproduced.

## Required first gates

### Claim tests

`.factory/claims.json` exists and has seven entries. After a clean `npm ci`, I
ran every listed command individually against the shipped `/demo` entry point;
each rebuilt production output and passed its one tagged Playwright test.

| Claim | Result | Evidence |
| --- | --- | --- |
| `csv-export` | PASS | `npm test -- --grep @claim:csv-export`: 1 passed |
| `offline-reload` | PASS | `npm test -- --grep @claim:offline-reload`: 1 passed |
| `device-only` | PASS | `npm test -- --grep @claim:device-only`: 1 passed |
| `encrypted-backup` | PASS | `npm test -- --grep @claim:encrypted-backup`: 1 passed |
| `print-brief` | PASS | `npm test -- --grep @claim:print-brief`: 1 passed |
| `json-backup` | PASS | `npm test -- --grep @claim:json-backup`: 1 passed |
| `paid-unlock` | PASS | `npm test -- --grep @claim:paid-unlock`: 1 passed |

### Cold first read

The live first screen plainly says **“Make your visit history clear.”** It says
this is for people whose symptoms change between appointments, and shows the
one-click action **“Try it with sample data”** beside “See a finished visit
history right away.” The action opens `/demo`, which immediately presents five
realistic sample entries and the persistent “Demo — sample data, nothing is
saved” banner with Reset demo and Start for real. This required gate passes.

## Build, identity, and functional QA

- `npm ci` passed (23 packages, 0 reported vulnerabilities).
- `npm test` passed: **27/27** Playwright tests.
- `npm run build` passed and produced `dist/`. Initial JS is 27.92 KB raw /
  10.18 KB gzip; CSS is 10.86 KB raw / 3.25 KB gzip; the 50,644-byte hero is
  within the applicable static budgets.
- `npm run test:live` passed. It SHA-256 compared the deployed JS/CSS with the
  current `dist/`, confirmed immutable executable-asset caching, no-store
  service-worker caching, the production $12 catalog record/return URL,
  HTTPS checkout redirect, and invalid-license rejection.
- Independent live demo exercise at 390 px: loaded five samples; saved a
  severity/tag/note; reloaded it successfully; rejected malformed
  `{"version":1,"entries":[{}]}` without changing the saved note; and
  Start for real removed the demo note before opening `/log`. A keyboard Enter
  save on the real log also persisted. No console or page errors occurred.
- Boundary/recovery coverage passed in the suite and was spot-checked live:
  future dates are rejected, CSV formula cells are neutralized, an empty print
  range announces “No saved notes fall in that date range,” encrypted backups
  restore, unreadable stored records expose recovery/export/clear actions, and
  removal has a 10-second Undo path.

## PWA, privacy, policy, and server checks

- In a fresh live browser context, `/demo` installed the versioned service
  worker cache `care-visit-brief-91b47ac735f4`, including `/index.html` and the
  executing hashed JS/CSS. After clearing the HTTP cache, setting the context
  offline, and reopening `/demo`, the demo banner and sample chronology loaded.
- A live waiting-worker simulation showed the persistent **“An update is
  ready / Reload to update”** prompt. The worker has `SKIP_WAITING`, old-cache
  cleanup, and `clients.claim()`.
- The normal demo flow made only same-origin requests; no analytics, third
  party fonts, or scripts are loaded. Optional billing sends only the supplied
  license token to `api.sociobot.in`; the demo has separate `demo:` IndexedDB
  and localStorage keys.
- Live response policy: HSTS, `X-Content-Type-Options: nosniff`,
  strict-origin referrer policy, and a restrictive self/Sociobot CSP are set.
  Hashed JS/CSS are `max-age=31536000, immutable`; `/sw.js` is
  `no-cache, no-store, must-revalidate`. Robots, sitemap, manifest, offline
  page, icons, social image, and all in-app links responded successfully; the
  checkout link returned an HTTPS 303.
- The only product server endpoint is license verification. A fresh burst of
  80 simultaneous invalid-token requests returned **30 × 200** then **50 ×
  429**. A 429 supplied `Retry-After: 4` (and `X-RateLimit-After: 4`), so
  rate limiting is present at an observed capacity of roughly 30 requests per
  burst.
- There is no sign-in or AI runtime in scope.

## Accessibility, responsive, and performance checks

- `/opt/fleet/lib/verify-url.sh https://care-visit-brief.sociobot.in
  /tmp/cvb-verify-live` passed: 685 ms load, title, `lang=en`, one `h1`, main
  landmark, no missing image alt, no unlabeled button, and no console/page
  errors. Evidence is in `/tmp/cvb-verify-live/` for this disposable worker.
- Independent `@axe-core/playwright` WCAG 2 A/AA scans of `/`, `/log`,
  `/demo`, `/privacy`, `/terms`, and the designed missing-page route found
  **zero serious or critical violations**. The 404 navigation itself correctly
  returns HTTP 404; Chromium logs that expected failed navigation response, not
  an application error.
- Keyboard Tab reaches the skip link, wordmark, navigation, fields, severity
  controls, tags, tools, and footer; focused controls use the 3 px ink ring.
  SPA navigation focuses and announces the destination heading. At 390 px,
  no horizontal overflow occurred; nav and tag targets measured at least
  44 × 44 px. Reduced-motion computes both animation and transition duration
  to 0.01 ms.
- Live mobile Lighthouse: **Performance 92, Accessibility 100, Best Practices
  100, SEO 100**; LCP 1307 ms and CLS 0.

## Defects by severity

None found. The prior malformed-import, demo-state isolation, update-path,
mobile-target, deletion-recovery, and asset-cache findings have fresh passing
coverage in this candidate.
