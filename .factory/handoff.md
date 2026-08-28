# Handoff — QA repair 3

## Repair commits and deployment

- Repaired candidate `4c76bedbde119a54e6245c2294b6c969a993f3b1` in
  `b4692ffe23fb4e9ae994d11b5a9801afe718f492` and `95ae985` on `main`.
- Pushed both commits to `origin/main`.
- Built `dist/` and deployed it with
  `/opt/fleet/lib/deploy-static.sh care-visit-brief /work/repo/dist` on
  2026-08-28. Live URL: https://care-visit-brief.sociobot.in.

## What was repaired

- The printable brief now opens a normal, writable browser popup instead of an
  isolated `noopener` tab; the browser regression opens the real popup and
  reads its chronology.
- Complete-log IndexedDB writes use an origin-wide Web Lock plus a latest-value
  read/write transaction. BroadcastChannel refreshes other open tabs. The
  two-tab test saves two simultaneous notes and confirms both after reload.
- New encrypted exports use AES-GCM with PBKDF2-SHA-256 at 600,000 iterations,
  can be restored in the product, and legacy 10,000-iteration exports remain
  recoverable so existing users are not stranded.
- The corrupt-record screen can now download its raw recovery copy, restore a
  backup, or remove just the unreadable local record. Invalid imports leave
  the current record intact.
- Deletions queue for a single undo action; future note dates are blocked in
  the native control and app guard; CSV formula-leading cells are apostrophe
  prefixed.
- Fixed 390 px reflow/target sizes, preserved the service-worker update notice
  during SPA navigation, moved SPA focus to the new heading and announced it,
  added `frame-ancestors 'none'`, and configured real HTTP 404 responses.
- Restored the researched $12 one-time unlock instead of dropping it: returned
  licenses are stored locally, verified at most once per day, support paste-to-
  restore, and unlock a printable personal cover note. The claim uses a
  recorded verification response; it never spends money in tests.

## Verification evidence

- Clean `npm ci`: passed (24 packages audited, 0 vulnerabilities).
- `npm test`: passed, **25/25** Playwright tests. `npm run build`: passed;
  `dist/` produced. Type checking runs in the build (`tsc -b`); this project
  has no separate lint script.
- Ran every exact claim command in `.factory/claims.json`: `csv-export`,
  `offline-reload`, `device-only`, `encrypted-backup`, `print-brief`,
  `json-backup`, and `paid-unlock` all passed.
- Local URL verifier: title, `lang`, one `h1`, `main`, image alt text, labelled
  buttons, and console errors all passed. The repository Axe Playwright scans
  have zero serious/critical WCAG 2 A/AA findings on `/`, `/log`, `/demo`,
  `/privacy`, `/terms`, and the not-found view. The standalone Axe CLI could
  not run because its Selenium Chrome binary is not installed; the project
  uses Playwright Chromium and `@axe-core/playwright` instead.
- Mobile 390 px test verifies no horizontal overflow after a 32-character tag
  and every tested navigation, tag, file, password, license, wordmark, and
  footer target is at least 44 px. Keyboard save, skip/focus behavior,
  reduced-motion behavior, multi-tab merging, restore recovery, real popup
  print, and a waiting-worker update navigation are covered in Playwright.
- Offline: a fresh profile loaded `/demo`, waited for the worker, switched
  offline, and reloaded the sample successfully both locally and live.
- Live browser check: `/`, `/log`, `/demo`, `/privacy`, and `/terms` each
  return 200 with one `h1`/`main`, route title, no page errors, and zero
  serious/critical Axe findings. Live `/demo` opens a populated printable
  popup. `/missing-page` returns the styled 404 page with HTTP 404. (Chromium
  logs the expected failed navigation resource for a 404 status.)
- Live identity: SHA-256 of deployed `/index.html` matches the built
  `dist/index.html` (`3ee47f80f4168ec12e32824837863b0b2fbf03e23b7bd06c3ed75e3975e874f5`).
  Headers include HSTS, `nosniff`, strict referrer policy, and CSP with
  `frame-ancestors 'none'`.
- Production asset sizes: JavaScript 27.37 KB raw / 9.94 KB gzip; CSS 10.68 KB
  raw / 3.22 KB gzip. Both remain below the static-product budgets.

## Known external blocker

The Sociobot production checkout registration is still unavailable. Rechecked
after deployment on 2026-08-28:

```text
GET https://api.sociobot.in/api/v1/products/care-visit-brief/checkout
404 {"error":"enabled factory product","status":404}
```

The app retains the required Sociobot/Dodo integration and its local return,
verification, revocation, and restore behavior. Enabling the production product
is a factory billing operation outside this repository; no billing or payment
infrastructure was changed here. Once it is enabled, rerun a live checkout,
returned-token, verification, cover-note, and restore-purchase smoke test.

## Run and deploy

```sh
npm ci
npm test
npm run build
/opt/fleet/lib/deploy-static.sh care-visit-brief /work/repo/dist
```
