# Polish round 1 — finding closure

Candidate base: `de0662bf54b05faf1d24cc15303c5a9d3afa70e4`  
Repair commits: `3a08cbf`, `65fdd14`, and the final live-evidence commit  
Live URL: https://care-visit-brief.sociobot.in  
Date: 2026-08-28

Every finding in `.factory/review-1.md` is mapped below. Local screenshots are in `.factory/polish-1/`; post-deploy screenshots are in `.factory/polish-1/live-verify/`.

| Finding | Change made | Evidence |
|---|---|---|
| F-1-1 | Added a compact, realistic latest-sample sheet above the form with **Add another note**. Tightened the mobile demo heading. | `@claim:demo-first-screen`; `demo-mobile-first-screen.png`; live `/?demo=1` at 390×844. |
| F-1-2 | Rebuilt print as a compact A4 chronology with page margins, date summary, oldest-to-newest rows, and explicit overflow refusal. | `@claim:print-brief` renders `.factory/polish-1/sample-visit-brief.pdf` and asserts one PDF page; live print rechecked. |
| F-1-3 | Added a recorded product fixture and assertions for 1,200 minor units, USD, `one_time`, checkout URL, and visible “$12 USD once” copy. | `@claim:paid-unlock`; `npm run test:live` checks the production USD 12 catalog record. |
| F-1-4 | Registered `demo-first-screen` and made the sample outcome visible in the initial viewport. | `@claim:demo-first-screen`; mobile screenshot; live URL check. |
| F-1-5 | Registered all daily note fields and checks after reload and in print. | `@claim:daily-note-fields`. |
| F-1-6 | Registered gap behavior and checks that no dates or warning are generated. | `@claim:blank-days`. |
| F-1-7 | Print now filters saved notes by the selected range; unsaved and out-of-range text are excluded. | `@claim:print-brief`. |
| F-1-8 | Unified the visible safety boundary: no diagnosis, interpretation, treatment recommendation, or clinician contact. | `@claim:safety-boundary`; Axe route suite; live `/terms` and `/?demo=1`. |
| F-1-9 | Registered and exercised saving, restore, CSV, JSON, encryption, print, and safety copy with no license. | `@claim:free-core`. |
| F-1-10 | Registered demo isolation across mutation, reset, exit, IndexedDB, localStorage, and the unchanged real timeline. | `@claim:demo-isolation`. |
| F-1-11 | Made the comparison measurable: new PBKDF2 cost 600,000; accepted legacy cost 10,000. | `@claim:encrypted-backup`; README. |
| F-1-12 | Intercepts the complete verification request and asserts GET, Sociobot origin, one `license` query field, empty body, and no health text. | `@claim:license-data-boundary`. |
| F-1-13 | Uses two clean browser contexts with one token and no copied health notes. | `@claim:license-restore`. |
| F-1-14 | Added merchant fixture plus active and revoked license responses; revoked state removes the cover-note field. | `@claim:billing-policy`; live `/terms`. |
| F-1-15 | Registered the build result and checks `dist/index.html`. | `@claim:build-output`. |
| F-1-16 | Split the README wording and registered rewrites, immutable assets, security headers, and complete 404 behavior. | `@claim:deployment-config`; live response checks. |
| F-1-17 | Registered the post-deploy identity and policy check as a deployment-only tagged claim. | `LIVE_CLAIM=1 npm test -- --grep @claim:live-deployment` from a clean clone. |
| F-1-18 | `setMetadata()` now updates title, description, canonical, OG title/description/URL, and Twitter title/description for every route and history move. | `route metadata follows deep links and browser history`; live `/log`, `/?demo=1`, `/privacy`, `/terms`. |
| F-1-19 | Rebuilt static 404 with header, nav, footer, Privacy, Terms, favicon, canonical, description, OG/Twitter metadata, and notebook styling. | `@claim:deployment-config`; `404-mobile.png`; live `/missing-page` returns 404. |
| F-1-20 | Replaced “Keep the whole notebook” with “Add a cover note to printed briefs.” | `.factory/copy-audit.md`; landing screenshot; live home. |
| F-1-21 | Standardized **note**, **timeline**, **visit brief**, and **medicine changes** throughout user-facing copy and controls. | Copy terminology table; full text scan; route screenshots. |
| F-1-22 | Replaced “field notes,” “handoff,” and “isolated sample”; expanded developer wording into direct sentences. | `.factory/copy-audit.md`; README; live first screens. |
| F-1-23 | Split the 25-word deployment sentence. The longest README sentence is now 18 words. | `.factory/copy-audit.md`. |
| F-1-24 | Removed “enough,” “useful,” and maintenance-funding claims. Copy now states observable fields and outcomes. | `.factory/copy-audit.md`; landing and README scans. |
| F-1-25 | Renamed actions to “Start my private timeline” and “Restore my unlock.” | `@claim:demo-first-screen`, `@claim:license-restore`; live controls. |

## Aggregate evidence

- Clean clone: every non-live claim command passed independently; full suite passed 40 tests with one intentional deployment-only skip.
- Local URL verifier: `.factory/polish-1/local-verify/verify.json`; no console errors, one `h1`, `lang=en`, one main, no missing alt or unnamed button.
- Local Lighthouse: `.factory/polish-1/local-lighthouse.json`; Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.36s; CLS 0.
- Build budget: JS 31.27 KB raw / 11.15 KB gzip; CSS 11.61 KB raw / 3.38 KB gzip; notebook hero 50 KB.
- Clean-clone deployment claim: `LIVE_CLAIM=1 npm test -- --grep @claim:live-deployment` passed against production.
- Cold live route/Axe audit: `.factory/polish-1/live-a11y.json`; five 200 routes, one true 404, correct titles/canonicals, and zero serious/critical violations.
- Cold live interaction audit: `.factory/polish-1/live-flow.json`; six same-origin requests, empty demo keys after exit, real note preserved, reset restored five notes, Back focused the `h1`, and offline sample reload passed.
- Live verifier: `.factory/polish-1/live-verify/verify.json`; no console errors or semantic failures.

## Controller isolation addendum

| Finding | Change made | Evidence |
|---|---|---|
| Controller evidence: demo reset/exit must preserve `REAL NOTE MUST REMAIN` and remove only demo data | `clearEntries(true)` now deletes the `demo:entries` record under the demo-only write lock. Reset recreates the five shipped notes only in that namespace; exit removes the record and `demo:` local state. `real:entries` is never opened by either cleanup action. Demo mutations are serialized, so Reset cannot race an in-flight save. | `@claim:demo-isolation` saves the exact real note, proves it remains after **Reset demo**, exits, proves it remains in the visible real timeline, and asserts `demo:entries === undefined`. It passed five consecutive isolated runs and the full 41-test single-worker suite. |
| Earlier multi-tab data-history finding | Coalesced cross-tab notifications with a browser storage-event fallback and guarded renders by generation, so an older IndexedDB read cannot repaint over a newly saved note. The notification has only scope, time, and a random token—never note data. | `two tabs merge health notes instead of replacing a stale record` passed ten consecutive times, then passed in the exact 41-test single-worker suite. |

## Final repair evidence — `13764a9`

- A fresh clone of pushed `main` ran all 18 non-live claim commands independently, then the exact 41-test suite with one worker: 40 passed; the deployment-only claim was intentionally skipped in that run.
- After static deployment, `LIVE_CLAIM=1 npm test -- --grep @claim:live-deployment --workers=1` passed from that clean clone.
- Cold live browser audit: [controller-live-audit.json](controller-live-audit.json) records correct route titles/canonicals, six 200 routes, a true 404, one `h1` per route, and zero serious/critical Axe findings. The mobile demo screenshot is [controller-live-demo-mobile.png](controller-live-demo-mobile.png).
- Live `/?demo=1` showed the sample at 611.8 px in the 844 px viewport. The production reset/exit check saved **REAL NOTE MUST REMAIN**, reset demo, exited demo, found that exact note in `real:entries`, and found no `demo:entries` record.
