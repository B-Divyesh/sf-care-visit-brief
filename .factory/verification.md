# Independent verification — FAIL

**Candidate:** `107a43fd6ee41008ad5ecee18688cfd4e7fc2d6e` (`main`)  
**Live URL:** https://care-visit-brief.sociobot.in  
**Verified:** 2026-08-28 (fresh `npm ci` checkout)

## Verdict

**FAIL — do not release.** The deployed site is the tested candidate, but a
malformed JSON file can overwrite a person's local health history and leave
the app unable to render on every subsequent load. This fails the required
invalid-input/recovery path for a local-first health record.

## First read and deployment identity

Cold-opening the live home page answers the required three questions in plain
words: **"Make your visit history clear"**; it is for people whose symptoms
change between appointments; and the first action is **"Try it with sample
data"**, with the adjacent explanation "See a finished visit history right
away." The one-click demo is present. This check passes.

I fetched the live HTML, service worker, manifest, built JS, CSS, hero WebP,
and social JPEG and SHA-256-compared each to `dist/`. All seven pairs were
identical. This is not a deployment-only failure or a stale deployment.

## Required claim tests

All commands in `.factory/claims.json` were run individually after `npm ci`.
Every command rebuilt the production app and passed its one tagged Playwright
test.

| Claim ID | Result | Evidence |
| --- | --- | --- |
| `csv-export` | PASS | `npm test -- --grep @claim:csv-export`: 1 passed |
| `offline-reload` | PASS | `npm test -- --grep @claim:offline-reload`: 1 passed |
| `device-only` | PASS | `npm test -- --grep @claim:device-only`: 1 passed |
| `encrypted-backup` | PASS | `npm test -- --grep @claim:encrypted-backup`: 1 passed |
| `print-brief` | PASS | `npm test -- --grep @claim:print-brief`: 1 passed |
| `paid-unlock` | PASS | `npm test -- --grep @claim:paid-unlock`: 1 passed |

## Checks that passed

- `npm ci` completed with 0 vulnerabilities.
- `npm test` passed: **13/13** Playwright tests. This includes the built-in
  axe WCAG 2 A/AA serious/critical checks on `/`, `/log`, `/demo`, `/privacy`,
  `/terms`, and the 404 route, keyboard saving, and all claims.
- Exact `npm run build` passed. Build output is `dist/`; JS is 20.42 KB
  (7.59 KB gzip), CSS is 9.19 KB (2.93 KB gzip), and the hero WebP is 50,644
  bytes — within the supplied static budgets.
- An independent live axe run found **0 serious/critical** WCAG 2 A/AA
  violations on all six routes above. Each had one `<h1>`, one `<main>`, a
  route-specific title, `lang="en"`, and no page/console errors.
- Live `/demo` made only same-origin requests during the normal demo flow.
  The app uses IndexedDB keys `demo:entries` and `real:entries`; the supplied
  demo reset/start-real logic keeps those namespaces separate.
- Normal demo flow works: sample history loads, severity/tags/note can be
  saved, out-of-range printable-brief dates announce the recovery message
  "No saved notes fall in that date range. Choose another range.", CSV/JSON
  and encrypted export work, and note text is HTML-escaped (no injected
  `<img>` element).
- Desktop and 390 px live screenshots were visually checked. No console or
  page errors appeared. Keyboard Tab traversal reaches the skip link,
  navigation, demo actions, fields, and severity controls; the focused
  controls expose the designed 3 px outline. Reduced-motion CSS removes the
  transitions.
- Live routes `/`, `/log`, `/demo`, `/privacy`, `/terms`, `/missing-page`,
  `/robots.txt`, `/sitemap.xml`, `/offline.html`, and the social image return
  200. CSP limits connections to self and the Sociobot licensing API; there
  are no third-party fonts/scripts or analytics requests. HSTS,
  `nosniff`, and strict-origin referrer policy are present.
- The product-unlock verification endpoint was burst-tested with 80 concurrent
  invalid-token requests. 29 returned 200 and 51 returned 429; the first
  observed 429 had `Retry-After: 2` (and `X-RateLimit-After: 2`). This passes
  the required rate-limit check at an observed threshold of about 29 requests
  in this burst.

## Release-blocking defects

### Critical — malformed JSON import destroys the current log and bricks the app

**Reproduction (clean browser, `/log`):** upload a file named
`malformed-backup.json` containing exactly `{"version":1,"entries":[{}]}`
through **Restore from a JSON backup**, then reload.

**Observed:** the import accepts the file, writes it over `real:entries`, and
raises `pageerror: Invalid time value`. After reload the body contains only
the skip link; no app UI is rendered and the user has no in-product recovery.
Existing local entries have already been overwritten.

**Cause/evidence:** `src/main.ts` only validates `version` and that `entries`
is an array before `saveEntries`; it does not validate each entry or await and
handle the asynchronous `render()` failure. Rendering the missing `date` then
throws in `dateLabel()`.

**Required repair:** fully schema-validate and normalize a backup before any
write, preserve the old record until validation succeeds, and provide an
in-app recovery/error state. Add a tagged regression test covering this exact
file and a reload.

### High — PWA update behavior required by the contract is absent

`public/sw.js` uses a fixed cache name, `care-visit-brief-v1`; it has no
build/version replacement, old-cache cleanup, `updatefound` handling, or
in-app **update available** toast. `src/main.ts` only registers `/sw.js`.
The work order requires a versioned cache plus a user-visible update path
after `skipWaiting()`/`clientsClaim()`.

The initial cache contents observed after a first visit were only `/`,
`/demo`, `/log`, `/privacy`, `/terms`, `/offline.html`, manifest, favicon,
and hero image — not the hashed JS or CSS required to execute the app. The
current claim test passes because it performs an additional online reload
before setting offline; it does not prove the stated "after the first visit"
condition without browser HTTP cache assistance.

### Medium — mobile tap targets miss the 44 px contract

At a 390 px viewport, measured live navigation targets are 21 px high
(`Log`, `Demo`, `Privacy`) and symptom/trigger/medicine tag buttons are 38 px
high. The task's mobile/accessibility acceptance contract requires 44 × 44 px
touch targets. Increase their hit areas while retaining the visual treatment.

### Medium — destructive health-record deletion has no undo or confirmation

Each **Remove entry** action immediately commits a delete. There is no undo,
confirmation, or recovery path, contrary to the supplied interaction rule
that destructive actions must be reversible or confirmed with specifics.

### Medium — live immutable asset caching is not configured

Hashed JS/CSS and static images on the live site return
`Cache-Control: public, must-revalidate, max-age=30`, not long-lived immutable
caching. This misses the PWA/performance caching requirement and makes every
return visit revalidate assets. Configure immutable caching for content-hashed
assets while keeping the service worker short-lived.

## Retest criteria

1. Import the malformed file above into a log with an existing entry; verify
   the old entry remains, an actionable error is announced, and reload still
   renders the log.
2. Add automated invalid-import/reload coverage and run every claim plus the
   complete suite from a clean install.
3. Implement and exercise a real service-worker update notification and
   versioned/pre-cached shell that includes the executing assets.
4. Recheck 390 px tap measurements, deletion recovery, and deployed cache
   headers after deployment.
