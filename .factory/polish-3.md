# Polish round 3 — complete finding closure

Reviewed candidate: `0efb1d1c84988c0462faadd8d161dff2e9a62dd1`

Review commit: `5f6f8325d6ea6465c921a735104456a0670cf090`

Repair commit: `091d2f19b919919323c182453f4f118c82e35824`

Deployment: `a81cf1b5-7fd3-4759-b341-40cfba335a41`

Live URL: <https://care-visit-brief.sociobot.in>
Date: 2026-08-28

All findings from reviews 1–3 were checked again. The round-3 copy changes did
not replace the handwritten lab-notebook visual system or the offline PWA
architecture.

## Review 3 findings

| Finding | Change made | Evidence |
|---|---|---|
| F-1-22 (reopened) | Replaced the README deployment jargon with the named checks: price, security headers, page titles and URLs, 404 page, and built-file hashes. Removed the remaining “isolated” demo metadata wording and notebook error wording. | Test: `reviewed copy names each action and error in plain words`; `@claim:live-deployment`. Screenshot: `live-landing-full-mobile.png`. Live: `/`, `/?demo=1`, and `/missing-page` passed the cold copy scan; built hashes matched. |
| F-3-1 | Changed “Mark the day” to “Choose the day’s severity.” | Test: `reviewed copy names each action and error in plain words`. Screenshot: `live-landing-full-mobile.png`. Live: `/` contains exactly one matching h2. |
| F-3-2 | Changed “Leave gaps alone” to “Leave days without notes blank.” | Test: `reviewed copy names each action and error in plain words`; `@claim:blank-days`. Screenshot: `live-landing-full-mobile.png`. Live: `/` contains exactly one matching h2. |
| F-3-3 | Replaced the generic caption with “Record only details you may want to discuss with a clinician.” | Test: `reviewed copy names each action and error in plain words`. Screenshot: `live-landing-full-mobile.png`. Live: `/` exposes the exact caption. |
| F-3-4 | Changed the README heading to “Use Care Visit Brief.” | Test: `reviewed copy names each action and error in plain words` reads `README.md` and rejects the former heading. Screenshot: `live-landing-mobile.png` records unchanged product identity. Live URL is not applicable to repository-only README copy; pushed commit `091d2f1` contains the heading. |
| F-3-5 | Changed both SPA and static 404 h1 to “We could not find this page.” The recovery sentence now names the timeline and sample. | Tests: `reviewed copy names each action and error in plain words`; `@claim:deployment-config`; `static deployment rewrites only real SPA routes and serves a 404 page for unknown URLs`. Screenshot: `live-404-mobile.png`. Live: `/missing-page` returned HTTP 404 with the exact h1, shared shell, metadata, Privacy, and Terms. |

## Review 1 findings retained and rechecked

| Finding | Change retained or strengthened | Evidence |
|---|---|---|
| F-1-1 | The latest realistic sample remains above the form and inside the first demo viewport. | Test: `@claim:demo-first-screen`. Screenshot: `live-demo-mobile.png`. Live: `/?demo=1`, sample bottom 611.8 px in an 844 px viewport. |
| F-1-2 | The shipped five-note range still renders as one A4 page; long ranges are refused with a shorter-range instruction. | Test: `@claim:print-brief` renders and counts the PDF page. Screenshot: `local-demo-mobile.png`. Live: `/?demo=1` produced `live-sample-visit-brief.pdf`; Chromium counted one page and found the sample text. |
| F-1-3 | The paid claim still asserts 1,200 minor units, USD, `one_time`, checkout URL, and visible $12 copy. | Test: `@claim:paid-unlock`; `@claim:live-deployment` checks the production price. Screenshot: `live-landing-full-mobile.png`. Live: `/` and `/terms`. |
| F-1-4 | The first-screen demo result remains registered in `claims.json`. | Test: `@claim:demo-first-screen`. Screenshot: `live-demo-mobile.png`. Live: `/?demo=1`. |
| F-1-5 | Severity, symptom, trigger, medicine change, and note text still survive reload and appear in print. | Test: `@claim:daily-note-fields`. Screenshot: `local-demo-mobile.png`. Live: `/?demo=1`. |
| F-1-6 | Days without notes remain absent and do not trigger warnings. The flaky initial count now waits for all five seeded notes. | Test: `@claim:blank-days`. Screenshot: `live-landing-full-mobile.png`. Live: `/` and `/?demo=1`. |
| F-1-7 | Print still excludes unsaved form text and notes outside the selected date range. | Test: `@claim:print-brief`. Screenshot: `local-demo-mobile.png`. Live: `/?demo=1`. |
| F-1-8 | The visible boundary still says there is no diagnosis, interpretation, treatment recommendation, or clinician contact. | Test: `@claim:safety-boundary`. Screenshot: `live-landing-full-mobile.png`. Live: `/`, `/?demo=1`, and `/terms`. |
| F-1-9 | Save, restore, CSV, JSON, encryption, print, and safety information remain usable without a license. | Test: `@claim:free-core`. Screenshot: `live-landing-full-mobile.png`. Live: `/log`. |
| F-1-10 | Reset and exit delete only `demo:entries` and `demo:` local state. A cold live run preserved `REAL LIVE ROUND 3 NOTE`. | Test: `@claim:demo-isolation`. Screenshot: `live-demo-mobile.png`. Live: `/?demo=1` → `/log`; `live-audit.json`. |
| F-1-11 | New encrypted backups still use 600,000 PBKDF2 iterations and restore the recorded 10,000-iteration legacy fixture. | Test: `@claim:encrypted-backup`. Screenshot: `local-demo-mobile.png`. Live: `/?demo=1`. |
| F-1-12 | License restore still sends one GET query field containing only the entered token. | Test: `@claim:license-data-boundary`. Screenshot: `live-landing-full-mobile.png`. Live: `/privacy` and `/log`. |
| F-1-13 | A second clean context still restores the cover-note feature without health notes. | Test: `@claim:license-restore`. Screenshot: `live-landing-full-mobile.png`. Live: `/log`. |
| F-1-14 | Merchant wording and revoked-license removal remain fixture-backed. | Test: `@claim:billing-policy`. Screenshot: `live-landing-full-mobile.png`. Live: `/terms`. |
| F-1-15 | The production build still creates `dist/index.html`. | Test: `@claim:build-output`. Screenshot: `live-landing-mobile.png`. Live: `/` loads the built shell. |
| F-1-16 | Static rewrites, immutable assets, response headers, and the full 404 remain machine-checked. | Test: `@claim:deployment-config`. Screenshot: `live-404-mobile.png`. Live: `/missing-page` returned 404; hashed assets returned immutable caching. |
| F-1-17 | The deployment claim now names and checks concrete outcomes, including live file hashes. | Test: `@claim:live-deployment` from the clean clone. Screenshot: `live-landing-mobile.png`. Live: production check passed after deployment. |
| F-1-18 | Each route still sets its own title, description, canonical, Open Graph, and Twitter values through history changes. | Test: `route metadata follows deep links and browser history`; `@claim:live-deployment`. Screenshot: `live-landing-mobile.png`. Live: all six 200 routes in `live-audit.json`. |
| F-1-19 | The true 404 still includes the shared header/footer, metadata, favicon, and legal links. | Test: `@claim:deployment-config`. Screenshot: `live-404-mobile.png`. Live: `/missing-page`, HTTP 404. |
| F-1-20 | Paid heading remains “Add a cover note to printed briefs.” | Test: full browser suite and copy audit. Screenshot: `live-landing-full-mobile.png`. Live: `/`. |
| F-1-21 | User copy consistently uses note, timeline, visit brief, medicine changes, cover note, and backup. | Test: `reviewed copy names each action and error in plain words`; all claim flows. Screenshot: `live-landing-full-mobile.png`. Live: `/`, `/log`, and `/?demo=1`. |
| F-1-23 | README sentences remain under 22 words; the longest is 20. | Test: `reviewed copy names each action and error in plain words`; `.factory/copy-audit.md`. Screenshot: `live-landing-mobile.png`. Live landing copy also passed the same cap. |
| F-1-24 | Copy continues to state observable fields and outcomes without “enough,” “useful,” or maintenance-funding claims. | Test: plain-word banned-term scan and all 19 registered claims. Screenshot: `live-landing-full-mobile.png`. Live: `/`. |
| F-1-25 | Actions remain “Start my private timeline” and “Restore my unlock.” | Tests: `@claim:demo-first-screen`; `@claim:license-restore`. Screenshot: `live-demo-mobile.png`. Live: `/?demo=1` and `/log`. |

## Review 2 finding retained and rechecked

| Finding | Change retained | Evidence |
|---|---|---|
| F-2-1 | Each history entry keeps its scroll position; Back/Forward restores it after rendering and focuses the route h1 without moving it. | Test: `browser Back and Forward restore each route scroll position and heading focus`. Screenshot: `.factory/polish-2/live-back-home-mobile.png`. Cold live: Back `/log` 320 px, Back `/` 900 px, Forward `/log` 320 px with h1 focus; `live-audit.json`. |

## Aggregate evidence

- Fresh clone of `091d2f1`: `npm ci` found zero vulnerabilities. Every one of
  the 18 local claim commands ran separately and passed. The post-deploy
  `@claim:live-deployment` command also passed from that clone.
- Full suite: 42 passed, one deployment-only skip. The exact work-order command
  `npm ci && npm test && npm run build` passed and produced `dist/index.html`.
- Local verifier: `local-verify/verify.json`. Live verifier:
  `live-verify/verify.json`; no console errors, one h1, one main, `lang=en`, no
  missing alt text, and no unnamed buttons.
- Axe WCAG 2 A/AA: zero serious or critical findings on `/`, `/log`,
  `/?demo=1`, `/demo`, `/privacy`, `/terms`, and the HTTP 404 route.
- Mobile Lighthouse: local and live both scored Performance 100,
  Accessibility 100, Best Practices 100, SEO 100. Live LCP was 1.282 s and CLS
  was 0; `live-lighthouse.json`.
- Build budget: JS 32.58 KB raw / 11.53 KB gzip; CSS 11.61 KB raw / 3.38 KB
  gzip; total live transfer measured 116,872 bytes.
- Cold offline check warmed the service worker, cleared HTTP cache, opened a
  new offline tab, and displayed the demo banner and shipped sample.

No finding remains open.
