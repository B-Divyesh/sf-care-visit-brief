# Independent verification 2 — FAIL

**Candidate:** `4c76bedbde119a54e6245c2294b6c969a993f3b1` (`main`)  
**Live URL:** https://care-visit-brief.sociobot.in  
**Verified:** 2026-08-28 from a clean checkout  
**Verdict:** **FAIL — do not release**

The live deployment matches the candidate build, so this is not a stale-deploy
result. The central printable-brief flow fails in a real browser, the advertised
checkout returns 404, and common multi-tab use can silently erase a saved health
note. There are also recovery, encrypted-backup, mobile, and claim-coverage
defects detailed below.

Raw command output, JSON, and screenshots from this run are retained at
`/tmp/care-visit-brief-qa-4c76bed/` in the verification container.

## Required first-read gate

**PASS.** A cold live visit at desktop and 390 px answers all three questions in
the first viewport:

- What it does: **“Make your visit history clear.”**
- For whom: **“For people whose symptoms change between appointments…”**
- What to do first: **“Try it with sample data,”** followed by “See a finished
  visit history right away.”

The action is visible without scrolling at both sizes. One click opens `/demo`,
shows five realistic entries, and displays **“Demo — sample data, nothing is
saved,” “Reset demo,”** and **“Start for real.”** Demo and real IndexedDB records
were independently confirmed under `demo:entries` and `real:entries`; leaving
the demo cleared only the demo key.

## Claims gate

`.factory/claims.json` exists with six entries. After `npm ci`, every exact
listed command completed successfully and reported one passing tagged test.
The pre-install bootstrap invocation could not find `tsc`, as expected before
dependencies existed; the post-install results below are the valid clean-clone
results.

| Claim | Listed command | Independent observable result |
| --- | --- | --- |
| `csv-export` | PASS | PASS: one header plus one row per record; see CSV security defect below. |
| `offline-reload` | PASS | PASS live: a fresh profile cached the shell and executing assets, cleared the HTTP cache, closed the warm tab, then reopened `/demo` offline with the banner and Aug 23 sample visible. |
| `device-only` | PASS | PASS for the tested free/demo flows: no cross-origin requests or analytics were observed. |
| `encrypted-backup` | PASS | Narrow download claim passes, but the product cannot open the encrypted file it creates. |
| `print-brief` | PASS in the repository test | **FAIL in Chromium on both local production build and live deployment.** The test replaces `window.open` and therefore does not test the promised browser outcome. |
| `paid-unlock` | PASS in the repository test | **FAIL live.** The test checks only the link string; the checkout endpoint returns HTTP 404. It never verifies a purchase/unlock or cover note. |

The claims contract therefore fails despite green tagged commands: two tests do
not assert their promised observable outcomes. Claim-like copy also lacks a
corresponding claim entry, including JSON portability, opening an encrypted
backup later, no analytics/data sale, and refund-driven license revocation.

## Release-blocking defects

### Critical — printable visit brief opens a blank tab

Reproduction on both `http://127.0.0.1:4173/demo` and the live `/demo`:

1. Click **Open printable brief** with the seeded date range.
2. Observe that Chromium opens an `about:blank` popup with an empty body.
3. The source page announces **“Your browser blocked the print window. Allow
   pop-ups and try again.”** even though the popup was allowed.

`src/main.ts:105` calls `window.open` with the `noopener,noreferrer` feature.
Chromium opens the isolated tab but returns `null` to the opener, so the app
treats it as blocked and never writes the brief. The tagged claim test mocks
`window.open` with a writable fake object, masking this real behavior. A
printable one-page handoff is the product's core job, so this is critical.

### High — the advertised $12 checkout is unavailable

Fresh `HEAD` and `GET` requests to
`https://api.sociobot.in/api/v1/products/care-visit-brief/checkout` both returned
HTTP 404. The GET body was:

```json
{"error":"enabled factory product","status":404}
```

This may be a product-registration/deployment issue rather than a frontend-code
issue, but it still makes the live paid offer unusable. The current claim test
only compares the `href` and cannot detect it.

### High — two open tabs silently overwrite a saved note

In a fresh live browser context, two `/log` tabs were opened before either
wrote. Tab A saved **“Saved in tab A”**; tab B then saved **“Saved in tab B.”**
Reloading tab A showed only Tab B's note. `saveEntries` replaces the complete
array using each tab's stale in-memory copy; there is no transaction merge,
revision check, storage notification, or visible conflict history. This is
silent health-record loss and violates the local-first conflict requirement.

### High — encrypted backups cannot be restored and use a weak KDF cost

A downloaded encrypted backup correctly contained AES-GCM/PBKDF2 metadata and
did not expose the note text. Uploading that same file through the only restore
control produced **“This file is not a complete Care Visit Brief JSON backup”**;
there is no password/decrypt/import path anywhere in the app or README. This
contradicts the UI sentence **“You need it to open this backup later.”**

The PBKDF2-SHA-256 work factor is also only 10,000 iterations, which is too low
for password-protecting sensitive health exports against offline guessing.

### High — existing corrupt local data has no usable recovery path

Seeding `real:entries` with the malformed record left by the previously reported
import defect and reloading `/log` correctly avoids a crash, but displays only
**“We could not open this record.”** The page tells the user to restore a backup
“from the log,” yet contains no file input, export, remove-bad-record, or reset
action. **Reload the record** returns to the same screen. Users already affected
by the prior release cannot reach the newly safe importer without deleting site
data and losing the record.

## Other defects

### Medium — repeated deletion bypasses undo

Remove two entries before using the toast, then click **Undo** once. Only the
second removal is restored; the first disappears permanently because the single
`pendingRemoval` slot is overwritten. In the live demo, Aug 23 and Aug 17 were
removed in sequence; Undo restored Aug 17 while Aug 23 remained lost.

### Medium — mobile reflow and target-size requirements still fail

At 390 px, a normal `/log` page can scroll 3 px horizontally. An allowed
32-character custom tag expands the page to 489 px, producing 99 px of horizontal
scroll and widening the form. Visible targets below the required 44 px included
the wordmark (27 px high), three custom-tag inputs (34 px), encrypted-backup
summary (24 px), file input (24 px), license input (30 px), and footer links
(16 px). The regression test covers only navigation and tag buttons.

### Medium — valid future dates undermine the historical record

The “Save today’s note” form has no `max`. It accepted `9999-12-31` and displayed
**Dec 31, 9999** at the top of the chronology. Future dates should be rejected or
explicitly explained so the appointment handoff cannot be accidentally distorted.

### Medium — CSV export permits spreadsheet-formula injection

A note beginning `=HYPERLINK(...)` was exported as a quoted cell that still
begins with `=`. Quoting does not neutralize formulas in common spreadsheet
programs. Prefix formula-leading user values safely when producing CSV.

### Medium — update notice is lost during SPA navigation

Using the production build behind a controlled service-worker revision, a new
worker reached `waiting` and the update toast appeared. Clicking the in-app
Privacy link re-rendered the shell, hid the toast, and left the worker waiting.
A full reload showed the toast again, and **Reload to update** then activated the
worker successfully. Preserve the waiting state across normal renders.

### Medium — routing misses the stated HTTP and focus behavior

- `/missing-page` renders the designed not-found view but returns HTTP 200;
  there is no `404.html`/response override.
- After SPA navigation to `/demo`, focus is on `BODY`, not the new heading.
  The code calls `focus()` on an `<h1>` without `tabindex`; no route-change
  announcement occurs.

### Low — documentation and response-policy gaps

- README identifies `dist/` but does not provide deployment instructions as
  required by the repository contract.
- The CSP and HSTS/nosniff/referrer headers are present, but CSP has no
  `frame-ancestors` protection for this sensitive local-data interface.

## Checks that passed

- `npm ci`: passed, 23 packages installed, 0 vulnerabilities.
- `npm test`: **17/17 passed** after an exact production build.
- `npm run build`: passed; `dist/` produced. No separate lint script exists;
  TypeScript checking runs through `tsc -b` in the build.
- Bundle sizes: JS 23.91 KB raw / 8.75 KB gzip; CSS 10.02 KB raw / 3.10 KB
  gzip; hero WebP 50,644 bytes. All are within supplied budgets.
- Live mobile Lighthouse: performance 91, accessibility 100, best practices
  100, SEO 100; LCP 1,202 ms, CLS 0, total transfer 62,901 bytes. Lighthouse
  lab TBT was 392 ms. A separate 4× CPU-throttled interaction trace observed a
  maximum Event Timing duration of 64 ms; field INP is not available in a
  one-run lab audit.
- Independent Playwright axe scans of `/`, `/log`, `/demo`, `/privacy`,
  `/terms`, and `/missing-page`: zero serious/critical WCAG 2 A/AA findings.
  All routes had `lang="en"`, one `<h1>`, one `<main>`, route titles, and no
  console/page errors.
- Required URL verifier passed locally and live. Keyboard Tab exposed a 3 px
  focus ring; required-date validation, short-password recovery, HTML escaping,
  malformed-import preservation, single-delete undo, refresh persistence, and
  reduced-motion behavior worked.
- PWA manifest parsed with no Chromium installability errors. Live Cache Storage
  used `care-visit-brief-aead073f2bd0` and contained `/index.html`, the offline
  page, manifest, favicon, hero, and current hashed JS/CSS. A true offline fresh
  tab reload of `/demo` passed after clearing the browser HTTP cache.
- Service-worker update activation itself passed in the controlled revision
  test. `sw.js` is served `no-cache, no-store`; hashed JS/CSS are served for one
  year with `immutable`.
- Response headers include CSP, HSTS, `X-Content-Type-Options: nosniff`, and
  `Referrer-Policy: strict-origin-when-cross-origin`.
- The live home shell, service worker, manifest, icons, offline page,
  robots/sitemap, hashed JS/CSS, hero, and social image — 14 served artifacts —
  SHA-256-match the candidate's `dist/` output.
- Licensing verify rate limit: an 80-request concurrent burst returned 30 HTTP
  200 responses and 50 HTTP 429 responses. Every observed 429 included
  `Retry-After: 4` (and `X-RateLimit-After: 4`), for an observed burst allowance
  of 30 requests.
- No sign-in exists, so Entra tenant verification is not applicable. There is no
  product backend beyond the Sociobot billing endpoint; library/CLI packaging is
  not applicable.

## Retest requirements

1. Exercise print using an unmocked browser popup and assert visible chronology
   plus the print call.
2. Enable the production Sociobot product and complete checkout, token return,
   verification, cover-note unlock, and restore-purchase tests.
3. Make IndexedDB writes merge safely across tabs and add a two-tab regression.
4. Add encrypted-backup decryption/import with an adequate KDF work factor.
5. Give corrupt stored records an in-place export/restore/reset recovery path.
6. Queue or confirm every deletion, fix all 390 px target/reflow defects, reject
   future dates, neutralize CSV formulas, retain update notices, and return a
   true 404 with correct SPA focus handling.
7. Correct claim coverage so each promise is tested through the real public
   behavior, then rerun the full matrix on the deployed candidate.
