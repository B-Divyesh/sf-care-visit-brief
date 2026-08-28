# Review 1 handoff — FAIL

**Candidate reviewed:** `61060740242176ac2d1e960f01e918b6caffb71e`

**Live URL:** https://care-visit-brief.sociobot.in

**Reviewed:** 2026-08-28

Adversarial first-read review 1 is complete. The full report is
`.factory/review-1.md`. Product code was not modified.

## What was done

- Opened the live site cold at 390 × 844 and 1440 × 900 before scrolling.
- Audited all live landing and README copy with word counts and rewrite
  findings.
- Exercised the demo banner, sample data, Reset, Start for real, IndexedDB
  namespace isolation, real-note preservation, request interception, and live
  offline reload.
- Ran all seven `.factory/claims.json` commands individually after `npm ci`.
- Checked every app route, metadata, real 404, internal/external links,
  browser Back, route focus/announcement, and the prior handoff's repair areas.
- Rendered the five-entry sample brief to A4 PDF; Chromium produced two pages.
- Ran the full suite, production build, live deployment checks, factory URL
  verifier, and live Playwright Axe scans.

## Verification results

```sh
npm ci
for claim_id in csv-export offline-reload device-only encrypted-backup print-brief json-backup paid-unlock; do
  npm test -- --grep "@claim:${claim_id}"
done
npm test
npm run test:live
```

- Seven claim commands: all executed; each reported 1 passing test.
- Full suite: 27/27 passed.
- Build: passed; `dist/` produced; JS 27.92 KB raw / 10.18 KB gzip.
- Live checks: passed.
- Live Axe: zero WCAG 2 A/AA violations on all app/legal routes and the 404.
- Factory URL verifier: no console errors or basic semantic failures.

## Known gaps / next steps

The verdict is FAIL with 25 findings. Blocking items are:

1. The first demo sample card is 1,882 px below the top on a 390 px screen, so
   the post-click first screen does not show the sample in use.
2. The five-entry shipped sample brief renders as two A4 pages, contrary to the
   brief's one-page contract.
3. The `paid-unlock` claim test does not assert its `$12 one-time` terms.

Major remaining work includes registering all public claims, making route
canonical/social metadata route-specific, and giving the real 404 the common
site shell and metadata. Minor copy and terminology findings are enumerated
with exact rewrites in `.factory/review-1.md`.
