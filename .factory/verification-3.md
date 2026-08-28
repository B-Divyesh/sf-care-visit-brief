# Independent verification 3 — FAIL

**Candidate:** `a48cc69abd8271a2857d75b70983fd5bc2df6d8e` (`main`)  
**Live URL:** https://care-visit-brief.sociobot.in  
**Verified:** 2026-08-28 from a clean candidate checkout  
**Verdict:** **FAIL — do not release**

The repaired core PWA passes its local and live functional checks, and the live
deployment byte-matches the candidate build. The release still fails because
the advertised **Buy the $12 unlock** action leads to a production endpoint
that returns HTTP 404. This was reproduced afresh after the candidate was
deployed; it is not a stale-deployment result.

## Mandatory first-read gate

**PASS.** A cold live visit at desktop and 390 px answers all three questions
in the first viewport:

- What: **“Make your visit history clear.”**
- Who: **“For people whose symptoms change between appointments…”**
- First action: **“Try it with sample data,”** followed by **“See a finished
  visit history right away.”**

The action is visible at 390 px (top 417 px, height 48 px). One click opens
`/demo`, focuses **“Review a sample visit history,”** shows five realistic
entries, and displays **“Demo — sample data, nothing is saved”** with **Reset
demo** and **Start for real**. Independent IndexedDB inspection found five
records under `demo:entries`; leaving demo cleared that key and preserved a
separately created record under `real:entries`.

## Claims gate

`.factory/claims.json` exists. After `npm ci`, every listed command was run
individually from the clean candidate checkout. Six use the documented `/demo`
sandbox; the paid fixture uses `/log?license=demo-license`. All seven commands
rebuilt the production app and passed one matching tagged test:

| Claim | Exact listed command | Result |
| --- | --- | --- |
| `csv-export` | `npm test -- --grep @claim:csv-export` | PASS — 1 passed |
| `offline-reload` | `npm test -- --grep @claim:offline-reload` | PASS — 1 passed |
| `device-only` | `npm test -- --grep @claim:device-only` | PASS — 1 passed |
| `encrypted-backup` | `npm test -- --grep @claim:encrypted-backup` | PASS — 1 passed |
| `print-brief` | `npm test -- --grep @claim:print-brief` | PASS — 1 passed |
| `json-backup` | `npm test -- --grep @claim:json-backup` | PASS — 1 passed |
| `paid-unlock` | `npm test -- --grep @claim:paid-unlock` | PASS — 1 passed with recorded verification response |

The paid claim's fixture test proves token storage, verification handling,
cover-note display, and printed output. It cannot make the currently missing
production checkout usable; that live defect remains release-blocking.

## Release-blocking finding

### High — advertised production purchase is unavailable

Fresh GET requests and the live page's buy link both target:

```text
https://api.sociobot.in/api/v1/products/care-visit-brief/checkout
```

Observed response on 2026-08-28:

```text
HTTP/2 404
{"error":"enabled factory product","status":404}
```

Every other crawled link returned 200. A user cannot buy the advertised $12
one-time unlock, so the paid offer and monetization flow are not end to end.
Product registration may be outside this repository, but acceptance is based
on the live product and therefore still fails.

## Other findings

### Medium — a returned license is verified twice concurrently

In a fresh live browser, opening `/log?license=qa-invalid-token` stripped the
token from the address bar and stored it correctly, but emitted **two** GET
requests to the same `/verify?license=...` endpoint. Both returned 200 and the
invalid license stayed locked. The paid-unlock contract permits verification
on first unlock and then at most once per day; the duplicated first-load call
unnecessarily consumes rate-limit capacity. The fixture claim test does not
assert request count.

### Medium — the paid claim test bypasses the required demo entry

The exact tagged test passes, but it opens `/log?license=demo-license` and
writes a sample note under the real-data namespace instead of entering at
`/demo`. Its browser context is fresh, so no actual user record is affected,
but it does not meet the verification contract that every claim be exercised
through the isolated demo entry point.

### Low — every SPA route has two skip links

Keyboard inspection found consecutive **Skip to main content** and **Skip to
content** links, both targeting `#main`. Both work and have a visible 3 px
focus outline, but the duplicate adds an unnecessary keyboard stop.

## Independent functional and recovery checks

- `npm ci`: PASS; 23 packages installed, 0 vulnerabilities.
- `npm test`: PASS, **25/25** Playwright tests after a production build.
- Standalone `npm run build`: PASS; `tsc -b` type checking and Vite build
  completed and produced `dist/`. There is no separate lint script.
- Live normal flow: PASS. Saved severity 4 and severity 0 notes; optional and
  custom tags worked; refresh persistence worked.
- Printable handoff: PASS in an unmocked Chromium popup. It contained the
  saved chronology and visible **Print this brief** action. An empty date range
  announced an actionable recovery message.
- Invalid input: PASS. A future date was rejected; malformed backup import
  retained the existing record through reload; a short encryption password
  was rejected; formula-leading CSV text is neutralized by the regression
  suite.
- Recovery: PASS. Two consecutive removals were both restored by one undo.
  The suite also passed corrupt-record export/restore/removal and encrypted
  backup restore, including legacy backups.
- Concurrency: PASS. Two live tabs saved simultaneously; both records remained
  after reload.
- Demo privacy: PASS. A live demo/log/export/sandbox flow made no cross-origin
  request. Source and policy inspection found no analytics, third-party font,
  CDN script, raw AI key, or Azure OpenAI call. The only allowed external
  runtime connection is the explicit Sociobot license check.
- Sign-in is absent, so Entra authority verification is not applicable. There
  is no product backend, library, or CLI to test beyond the billing endpoint.

## Accessibility and responsive checks

- Independent live Playwright Axe scans of `/`, `/log`, `/demo`, `/privacy`,
  `/terms`, and the not-found page found **0 serious/critical WCAG 2 A/AA
  violations**.
- All routes have `lang="en"`, route-specific titles, one `<h1>`, and one
  `<main>`. Normal routes produced no console/page errors. The expected browser
  resource error accompanies the intentional HTTP 404 page.
- Keyboard-only entry and Enter submission passed. Route navigation moves
  focus to the new heading and announces it. Focused controls have a designed
  3 px outline and no keyboard trap was found.
- At 390 px there was no horizontal overflow and no visible link, button,
  input, textarea, or summary below 44 px in either dimension. The first demo
  action remained above the fold. A 200% zoom check at a 780 px viewport found
  no horizontal overflow or clipped controls.
- With `prefers-reduced-motion: reduce`, entry animation and transition
  durations reduce to 0.01 ms. No autoplay or flashing content exists.
- Desktop and full 390 px screenshots were visually reviewed; no clipping,
  overlap, hidden controls, or layout shift was observed.

## PWA, deployment, policy, and performance

- True live offline reload passed from a fresh browser profile after one
  `/demo` visit, worker readiness, browser HTTP-cache clearing, closure of the
  warm tab, and offline opening in a new tab. The banner and Aug 23 sample
  rendered offline.
- The live cache was `care-visit-brief-f3066f040e11` and contained
  `/index.html`, the offline page, manifest, favicon, hero, and current hashed
  JS/CSS. The full suite also passed the waiting-worker update persistence and
  activation checks.
- Chromium reported no manifest errors. It has a versioned start URL,
  standalone display, matching theme/background colors, and 192/512 icons
  with a maskable 512 icon.
- The live home, worker, manifest, offline page, robots, sitemap, 404 page,
  current JS/CSS, hero, social image, favicon, app icons, and Apple icon all
  SHA-256-match `dist/`. `/missing-page` returns the styled page with HTTP 404.
- Headers include HSTS, `nosniff`, strict-origin referrer policy, and CSP with
  `frame-ancestors 'none'`. The worker is `no-cache, no-store`; hashed assets
  and the hero are served for one year with `immutable`.
- Build sizes: JavaScript 27.37 KB raw / 9.94 KB gzip, CSS 10.68 KB raw /
  3.22 KB gzip, hero WebP 50.64 KB. All are within the supplied budgets.
- Fresh mobile Lighthouse: performance **93**, accessibility **100**, best
  practices **100**, SEO **100**; FCP 0.9 s, LCP 1.4 s, CLS 0, TBT 330 ms,
  and total transfer 112 KiB.
- Billing verify rate limit: an 80-request concurrent burst returned 30 HTTP
  200 and 50 HTTP 429 responses. Every 429 had `Retry-After: 4`; observed burst
  allowance was 30 requests.

## Required next actions

1. Enable/register the production Sociobot product and verify the checkout,
   returned-token, cover-note, and restore-purchase flow live.
2. Move the paid fixture through the demo entry and coalesce returned-license
   verification so only one request is made.
3. Remove the duplicate skip link, then rerun the full candidate and live
   matrix.
