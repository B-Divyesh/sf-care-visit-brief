# Care Visit Brief — repair 6 handoff

**Status:** PASS; the review-5 quality-gate finding is closed

**Repair implementation:** `2c90f150efa61c3b05c1eb033ecd93198dc782d9`
**Last product-runtime change:** `091d2f19b919919323c182453f4f118c82e35824`
**Deployment:** `09777afb-b712-48eb-af87-b257d9aacd03`
**Live URL:** <https://care-visit-brief.sociobot.in>
**Verified:** 2026-09-06

## What changed

- Replaced the hard-coded `2026-08-28` date assertion with a clock-controlled
  outcome test. It fixes the browser at 2030-02-03, verifies that the form
  starts on that date, rejects 2030-02-04 through the native constraint, and
  then rejects it again through the app guard after that constraint is removed.
- The regression also proves that both rejected submissions leave the timeline
  empty, that a note for the fixed current date saves, and that its
  formula-leading CSV value remains neutralized.
- Made the print-overflow claim wait for each extra note to appear before
  continuing. This keeps the claim focused on the observable saved-note result
  and removes a timing race.
- No runtime source, product copy, price, storage model, visual asset, or public
  claim changed. The deployed JS and CSS remain byte-identical to the last
  product-runtime commit, `091d2f1`.

## Clean verification

A fresh local clone of `2c90f15` ran `npm ci` with zero reported
vulnerabilities. The documented gate then passed:

```sh
npm test
npm run build
```

The full suite reported **42 passed and one intentional deployment-only
skip**. The build created `dist/index.html`; initial JS is 32.58 KB raw /
11.53 KB gzip and CSS is 11.61 KB raw / 3.38 KB gzip.

Every one of the 19 commands in `.factory/claims.json` was then run separately
after `npm ci`. All 18 local claims passed. The deployment-only command passed
against production and confirmed the USD 12 one-time offer, route metadata,
security headers, true 404, service worker, and exact deployed JS/CSS hashes.
An initial discarded orchestration attempt addressed the clean clone before
its dependencies were installed and could not find `tsc`; no result from that
pre-prerequisite attempt is counted here.

## Deployment and live checks

The existing `sf-care-visit-brief` Azure Static Web App in `centralus` was
reused. The static deploy succeeded as deployment
`09777afb-b712-48eb-af87-b257d9aacd03`; the custom HTTPS origin returned 200.
No database, backend, replica, billing registration, DNS ownership, or other
product was changed. The product is a local-first static PWA, so server SQLite
and backend health/restart checks do not apply.

Fresh 390 × 844 phone and 1440 × 900 desktop contexts confirmed the headline
“Turn symptom notes into a visit brief,” the audience sentence, and **Try it
with sample data** before scrolling. The phone facts end at 721 px. One click
opened five realistic notes; the latest sample ends at 612 px.

The persistent demo banner remained after a demo save and reset. Reset removed
the demo-only note, **Start my private timeline** cleared `demo:entries` and
all `demo:` local state, and the separately saved real note remained. Normal
landing/demo use contacted only the product origin. The five-note sample
rendered as one A4 PDF page. A fresh service-worker context cleared its HTTP
cache and reopened the sample offline.

All product routes returned the expected titles, one h1, and one main. The
deliberate unknown route returned HTTP 404 with the shared shell and recovery
links. Privacy and Terms returned 200; the checkout returned HTTPS 303.
Keyboard focus reached the skip link and moved to the route heading. At 390 px
the page had no horizontal overflow and all 42 inspected interactive targets
were at least 44 × 44 px. Reduced motion computed to 0.01 ms.

`/opt/fleet/lib/verify-url.sh` passed with no errors, `lang=en`, one h1, one
main, complete alt text, and named buttons. Fresh Axe WCAG 2 A/AA scans found
zero serious or critical issues across `/`, `/log`, `/?demo=1`, `/demo`,
`/privacy`, `/terms`, and the designed 404.

Mobile Lighthouse scored **100 Performance, 100 Accessibility, 100 Best
Practices, and 100 SEO**. LCP was 1.3 s, CLS was 0, total blocking time was
0 ms, and transfer was 114 KiB. The first Lighthouse browser process crashed
in the container; a retry with shared-memory-safe Chromium flags completed and
is the result reported here.

## Earlier findings

- Review 5's only finding is closed by the clock-controlled normal, invalid,
  and recovery-path regression plus the passing clean full suite.
- Review 1 findings F-1-1 through F-1-25 remain closed by the populated
  first-viewport demo, one-page print, 19-claim registry, route metadata,
  complete 404, consistent terminology, and plain copy checks.
- Review 2 finding F-2-1 remains closed by the Back/Forward scroll and heading
  focus regression.
- Review 3 findings F-1-22 and F-3-1 through F-3-5 remain closed by the plain
  headings, caption, README, and 404 regressions.
- Verification rounds 1 through 4 remain closed by current malformed-backup,
  concurrent-write, encrypted/legacy restore, deletion undo, future-date, CSV,
  update, cache, touch-target, demo-local-state, billing, route, and print
  coverage. Review 4 and verification 5 had no open product finding.

## Evidence and known gaps

- `/work/.evidence/repair-6-live/` contains the current phone/desktop screens,
  demo and 404 screens, one-page sample PDF, URL verification, route/Axe/demo/
  offline audit, and Lighthouse JSON.
- `/work/.evidence/catalog-description.txt` matches the 70-character,
  verb-first `.factory/catalog-description.txt`.
- The checkout and production product registration are active. No payment was
  attempted; recorded product and entitlement fixtures cover the unlock,
  restoration, refund, and license-data boundary without inventing a payment.
- No AI feature was added. Deterministic local formatting is sufficient for
  this sensitive offline job and avoids a new health-data disclosure path.

No known defect or deferred minor finding remains in the assigned product
scope.

---

# Care Visit Brief — review 5 handoff

**Status:** FAIL; one quality-gate finding is open

**Implementation candidate:** `091d2f19b919919323c182453f4f118c82e35824`
**Review documentation:** `7cb744a26595c33edbf3196025e09638182e7b47` (before this report commit)
**Live URL:** <https://care-visit-brief.sociobot.in>
**Reviewed:** 2026-09-06

## Review 5 result

- No product code was changed. The report is `.factory/review-5.md`.
- `npm ci` passed. All 19 registered claim commands, including the deployed
  asset check, passed individually from the clean checkout. `npm run build`
  passed and generated `dist/index.html`.
- Fresh phone and desktop live review, populated demo/reset/isolation, one-page
  print output, offline reload, links/routes/404, URL verifier, and Axe scans
  passed. The current candidate closes all earlier review and verification
  findings; the report records the evidence and disposition matrix.
- The release is **not accepted** because `npm test` fails one date-dependent
  non-claim test. `tests/accessibility.spec.ts:149` expects the obsolete fixed
  max date `2026-08-28`; on the review date the app correctly returns
  `2026-09-06`. The suite result is 42 passed, 1 failed.

## Next step

Repair the stale date expectation by freezing time or deriving the expected
date, then run `npm ci && npm test && npm run build` and repeat the full review
gate. Do not mark the product PASS until that command passes.

---

# Care Visit Brief — review 4 handoff

**Status:** PASS; no review finding remains open

**Review commit:** pending reviewer documentation commit

**Live URL:** <https://care-visit-brief.sociobot.in>
**Date:** 2026-08-28

## Review 4 work

- Performed the required cold 390 px and desktop review against the deployed
  product without changing product code.
- Wrote `.factory/review-4.md`, including the complete landing/README copy
  count, demo/storage exercise, claim matrix result, live routing/link checks,
  and recheck of every prior finding.
- `npm ci` reported zero vulnerabilities. Every one of the 19 registered
  claim commands passed, including the live deployment claim. `npm test`
  passed 42 tests with one expected deployment-only skip; `npm run build`
  passed and created `dist/`.
- The live demo showed five sample notes in the first 390 px viewport, stayed
  separate from a real saved note through reset and exit, and printed one A4
  page. Network capture during normal landing/demo use was same-origin only.
- Route, header, metadata, shell 404, link, responsive, keyboard, and Axe
  checks passed. No AI feature is warranted by this local-first product brief.

## Known gaps / next steps

None found. Retain the demo-isolation and full claim checks when changing
storage, printing, or billing.

---

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
