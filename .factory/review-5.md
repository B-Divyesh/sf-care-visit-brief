# Print a clear symptom timeline — review 5

**Verdict: FAIL**

**Reviewed:** 2026-09-06  
**Live URL:** <https://care-visit-brief.sociobot.in>  
**Implementation candidate reviewed:** `091d2f19b919919323c182453f4f118c82e35824`  
**Documentation checkout:** `7cb744a26595c33edbf3196025e09638182e7b47`

The live product works for the job: a person with changing symptoms can save a
small private daily note and print a short visit brief for a clinician. It is
for people who need an accurate history between appointments. On both a fresh
390 × 844 phone and 1440 × 900 desktop, before scrolling, the page says
“Turn symptom notes into a visit brief,” identifies that audience, and makes
**Try it with sample data** the visible first action.

This review is nevertheless **FAIL**. The documented clean quality command,
`npm test`, currently fails on 2026-09-06. Every registered public claim was
tested and passed; none is untested.

## Finding

### Medium — `npm test` is date-dependent and fails from the documented clean setup

- **Evidence:** After `npm ci`, the 43-test `npm test` run had one failure:
  `tests/accessibility.spec.ts:149` expects the date input’s `max` value to be
  the fixed string `2026-08-28`. The running product correctly produces the
  current date, `2026-09-06`, so the expectation times out. Re-running only
  that test reproduces the same failure.
- **Why this is a finding:** The product contract requires `npm test` to pass
  locally. A clean verification on any date after 2026-08-28 fails before it
  can exercise that test’s future-date and CSV-safety assertions.
- **Scope:** This is a stale test fixture, not evidence that the live date
  guard is wrong. A direct live invalid-date exercise produced “Choose today
  or an earlier date for a daily note.”
- **Repair:** Make the expected maximum date derive from the same current-date
  value used by the app (or freeze time explicitly in the test), then rerun the
  full suite from a clean checkout.

**Finding count: 1. Untested public claims: 0.**

## Claims and build evidence

`npm ci` completed with zero reported vulnerabilities. I ran every command in
`.factory/claims.json` individually from this clean checkout. All 19 passed:

| Claims | Result |
| --- | --- |
| `csv-export`, `offline-reload`, `device-only`, `encrypted-backup`, `print-brief`, `json-backup` | PASS |
| `demo-first-screen`, `daily-note-fields`, `blank-days`, `safety-boundary`, `free-core`, `demo-isolation` | PASS |
| `paid-unlock`, `license-data-boundary`, `license-restore`, `billing-policy` | PASS |
| `build-output`, `deployment-config`, `live-deployment` (with `LIVE_CLAIM=1`) | PASS |

The live-deployment claim SHA-256 compared the live JS and CSS to this build,
checked the USD 12 product, routes, headers, 404, service worker, and invalid
license behavior. `npm run build` also passed and produced `dist/index.html`.
The build reports 32.58 KB raw / 11.53 KB gzip JS and 11.61 KB raw / 3.38 KB
gzip CSS. The full suite is the sole failed quality command: **42 passed, 1
failed** as described above.

## Fresh live browser review

- Phone and desktop had HTTP 200, no console or page errors, one h1, and the
  route title “Care Visit Brief — Print a clear symptom timeline.”
- A fresh phone demo showed its five realistic notes, including “Worse than
  usual after two poor nights.” at 612 px, inside the 844 px first viewport.
  The persistent banner read “Demo — sample data, nothing is saved,” with
  **Reset demo** and **Start my private timeline**.
- In a clean context I saved a real note, added a demo-only note, reset the
  demo, and left it. The demo note disappeared and the real note remained.
  The sample printed to a one-page A4 PDF and contained the sample text.
- A freshly warmed service worker served `/?demo=1` offline after the HTTP
  cache was cleared. It showed both the demo banner and sample note.
- The future-date recovery message was actionable. The existing claim suite
  additionally passed normal save/reload, exports, encrypted and legacy
  backup restore, malformed-backup recovery, date-range overflow, deletion
  undo, two-tab merge, formula neutralization, and licensing boundaries.
- The product is a static local-first PWA. Tenant isolation, server restart,
  health endpoint, and request-rate allowance checks for a product backend do
  not apply. The optional Sociobot license verification is tested by its
  recorded-fixture privacy and restoration claims; no health note is sent.

## Accessibility, privacy, routing, and links

- `/opt/fleet/lib/verify-url.sh` passed: 837 ms load, `lang=en`, one h1, a
  main landmark, no missing image alt text or unnamed buttons, and no errors.
- Fresh Axe WCAG 2 A/AA scans had no violations on `/`, `/log`, `/?demo=1`,
  `/privacy`, `/terms`, and `/missing-page`.
- Tab reaches the skip link with the designed 3 px ink focus outline. Reduced
  motion computed to `0.00001s`. The full suite's route/history and target
  checks remain present; the independent phone demo had no overflow.
- All real routes returned their route-specific titles and a single h1/main.
  All product links returned 200; the checkout link returned its expected HTTPS
  303. The missing route deliberately returned HTTP 404, with its complete
  header, footer, Privacy and Terms links, and designed recovery path. That
  expected 404 is not a defect.
- Normal demo capture was same-origin, and the registered device-only and
  license-data-boundary claims passed. There are no analytics, CDN fonts, or
  runtime AI calls. Privacy and Terms are available at `/privacy` and `/terms`.

## Earlier findings and current disposition

| Earlier report | Finding disposition proved this review |
| --- | --- |
| Review 1, F-1-1 through F-1-25 | Closed. The first viewport contains the populated sample; the five-note print is one A4 page; each formerly unlisted statement now has one of the 19 tested claims; route metadata, complete 404 shell, terminology, action wording, and copy constraints are present. |
| Review 2, F-2-1 | Closed. The retained history regression test covers Back/Forward scroll and focused route headings; the implementation is unchanged from the reviewed candidate. |
| Review 3, reopened F-1-22 and F-3-1 through F-3-5 | Closed. Live headings say “Choose the day’s severity” and “Leave days without notes blank”; the hero caption, README use heading, and 404 error wording are plain and specific. |
| Verification, five defects | Closed by current claim and live coverage: malformed backup recovery, update behavior, 44 px controls, undoable deletion, and immutable executable-asset caching. |
| Verification 2, critical/high/medium/low defects | Closed by current claim/suite coverage: printable brief, checkout, concurrent notes, encrypted/legacy backups, corrupt-store recovery, repeated undo, mobile layout, date guard, CSV neutralization, update toast, route focus/404, and policy/docs. |
| Verification 3, three defects | Closed. The live checkout is an HTTPS 303, license handling is fixture-covered, the paid claim enters demo, and the current shell has one skip link. |
| Verification 4, high and low findings | Closed. A direct real/demo/reset/exit exercise preserved the real note, and every claim invocation passed individually in this review. |
| Review 4 and Verification 5 | Those reports had no open defect. Their reported successful product paths were independently repeated above. |

The new date-dependent test failure is not a reopening of a prior product-path
finding. It prevents a PASS until the required full suite passes.
