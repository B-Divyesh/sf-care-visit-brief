# Polish round 2 — complete finding closure

Candidate reviewed: `1df58d951c91e6acc1cf82c297e61245544120bb`
Repair commit: `9f5b7af` (`fix: restore scroll position on route history`)
Live URL: <https://care-visit-brief.sociobot.in>
Date: 2026-08-28

I read `review-1.md`, `review-2.md`, `polish-1.md`, and the previous handoff.
The current repair changes the one remaining failure. The first-round changes
were retained and retested from a fresh clone and on production.

| Finding | Change made | Evidence |
|---|---|---|
| F-1-1 | Kept the realistic latest sample note above the demo form. | `@claim:demo-first-screen`; live `/?demo=1` sample ends at 612 px in an 844 px viewport (`live-audit.json`). |
| F-1-2 | Kept the compact, range-limited A4 print brief. | `@claim:print-brief` from clean clone. |
| F-1-3 | Kept the recorded USD 12 / one-time billing assertion. | `@claim:paid-unlock` from clean clone; deployed `@claim:live-deployment`. |
| F-1-4 | Kept the registered first-screen demo outcome. | `@claim:demo-first-screen`; live demo audit. |
| F-1-5 | Kept save/reload/print coverage for severity, tags, medicine changes, and note text. | `@claim:daily-note-fields` from clean clone. |
| F-1-6 | Kept the missed-day-safe timeline and claim. | `@claim:blank-days` from clean clone. |
| F-1-7 | Kept range filtering that excludes unsaved and out-of-range text from print. | `@claim:print-brief` from clean clone. |
| F-1-8 | Kept the visible safety boundary and no-contact behavior. | `@claim:safety-boundary` from clean clone; live home, Terms, and demo audit. |
| F-1-9 | Kept free access to the core log, recovery, export, print, and safety information. | `@claim:free-core` from clean clone. |
| F-1-10 | Kept separate demo storage, reset, and exit cleanup. | `@claim:demo-isolation` from clean clone. |
| F-1-11 | Kept explicit 600,000-current / 10,000-legacy encrypted-backup compatibility. | `@claim:encrypted-backup` from clean clone. |
| F-1-12 | Kept the license-token-only request boundary. | `@claim:license-data-boundary` from clean clone. |
| F-1-13 | Kept second-context license restore without health-data transfer. | `@claim:license-restore` from clean clone. |
| F-1-14 | Kept fixture-backed merchant and revoked-license behavior. | `@claim:billing-policy` from clean clone; live Terms audit. |
| F-1-15 | Kept the enforced `dist/index.html` production output. | `@claim:build-output` from clean clone. |
| F-1-16 | Kept the tested static rewrites, cache policy, headers, and complete 404. | `@claim:deployment-config`; live `404` audit. |
| F-1-17 | Kept the deployment-only identity and policy check. | `LIVE_CLAIM=1 npm test -- --grep @claim:live-deployment` passed from clean clone. |
| F-1-18 | Kept route-specific title, canonical, Open Graph, and Twitter metadata. | Production route audit in `live-audit.json`; deployment claim passed. |
| F-1-19 | Kept the shell, metadata, favicon, and legal links on the true 404. | Production `404` audit in `live-audit.json`; deployment claim passed. |
| F-1-20 | Kept the paid heading as “Add a cover note to printed briefs.” | Live home audit and `.factory/copy-audit.md`. |
| F-1-21 | Kept note, timeline, visit brief, and medicine changes as the consistent user terms. | `.factory/copy-audit.md`; clean full suite passed. |
| F-1-22 | Kept direct, plain product wording. | `.factory/copy-audit.md`; cold live home audit. |
| F-1-23 | Kept the split deployment wording within the copy limit. | `.factory/copy-audit.md`. |
| F-1-24 | Kept observable, claim-backed product wording. | Claim registry commands all passed from clean clone. |
| F-1-25 | Kept result-naming actions for entering demo and restoring a purchase. | `@claim:demo-first-screen`, `@claim:license-restore`; live demo audit. |
| F-2-1 | Added per-history-entry scroll coordinates. `navigate()` snapshots the current entry before `pushState`; `popstate` waits for the destination render, focuses its `h1` without scrolling, then restores the saved position. Browser automatic restoration is set to manual to prevent a race. | New Playwright regression: `browser Back and Forward restore each route scroll position and heading focus`. Cold production audit: Back restored 320 px on `/log`, 900 px on `/`, and Forward restored 320 px on `/log`; `live-back-home-mobile.png`. |

## Exact verification

- Fresh clone at `9f5b7af`: `npm ci`, then each of the 18 non-deployment
  commands in `.factory/claims.json` separately, all passed. `npm test` then
  passed the complete suite (41 passed, with the deployment-only claim
  intentionally skipped).
- Fresh-clone production command: `LIVE_CLAIM=1 npm test -- --grep
  @claim:live-deployment` passed after deploy.
- Local regression: `npm test -- --grep "browser Back and Forward restore each
  route scroll position and heading focus" --workers=1` passed.
- Production verifier: `live-verify/verify.json` records 1.208 s cold load,
  no console errors, one h1, one main, `lang=en`, and no missing image alt or
  unnamed button.
- Production route/Axe/offline/history audit: `live-audit.json` records six
  200 routes, one true 404, zero serious/critical WCAG 2 A/AA violations,
  first-viewport demo content, offline sample reload, no application console
  errors, and the exact scroll/focus results above.

No findings remain open.
