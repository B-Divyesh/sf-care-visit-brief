# Handoff — Care Visit Brief v1

## Independent verification status: **FAIL**

Candidate `107a43fd6ee41008ad5ecee18688cfd4e7fc2d6e` was independently tested
against https://care-visit-brief.sociobot.in on 2026-08-28. The live files
match the candidate byte-for-byte, all six listed claim tests and the full
13-test suite pass, but this candidate is **not releasable**.

The blocker is a malformed JSON restore: a file with
`{"version":1,"entries":[{}]}` overwrites the current local log, throws
`Invalid time value`, and leaves the app blank after reload. There is no
in-product recovery. Additional release findings are missing required PWA
update/versioned-precache behavior, sub-44 px mobile targets, unconfirmed
entry deletion, and 30-second non-immutable asset caching. See
`.factory/verification.md` for exact reproductions, passed checks, headers,
rate-limit evidence, and retest criteria.

## What shipped

- A local-first PWA for tiny daily symptom notes: severity, optional symptom/trigger/medicine tags, and a short note.
- Missed-day-safe timeline, CSV/JSON backup, AES-GCM encrypted backup, JSON restore, and printable visit brief by date range.
- Isolated `/demo` sandbox with five realistic entries, its own IndexedDB key (`demo:entries`), reset, and start-for-real action. Real entries use `real:entries`.
- Offline app shell, manifest, icons, cache service worker, offline page, metadata, legal pages, 404 state, sitemap, and static-host security configuration.
- One-time $12 Sociobot unlock: checkout link, URL license capture, local license restore, daily cached verification, and an optional personal cover note in printed briefs. Core logging and exports remain free.
- Original notebook still-life art, generated with the factory image tool. Reviewed source and prompt sidecar are in `assets/src/`; shipped hero WebP is 50 KB.

## Run and verify

```sh
npm install
npm test
npm run build
```

`npm test` passed: 13 Playwright tests. They cover every claim in `.factory/claims.json`, keyboard saving, all routed page shells, serious/critical axe findings, console errors, demo isolation, offline reload after first visit, CSV rows, encrypted backup metadata, printable chronology, and paid checkout/license restore UI.

`npm run build` passed and writes `dist/index.html`. Final first-load bundles: JavaScript 7.59 KB gzip and CSS 2.93 KB gzip. The LCP image is 50 KB WebP. These are below the static budgets.

## Lighthouse-class checks

- Axe WCAG 2 A/AA serious and critical violations: 0 across `/`, `/log`, `/demo`, `/privacy`, `/terms`, and the 404 route.
- Semantic/console checks are included in the Playwright suite: title, `lang=en`, exactly one h1, one main landmark, and no console errors.
- A Lighthouse mobile CLI attempt could not produce a score in this container because the bundled Chromium tab crashed. This is an environment limitation; the measured bundle sizes above are recorded instead.

## Known gaps / next steps

- The backup restore path currently accepts standard JSON exports; encrypted backup import is intentionally not present because it needs a careful password/decryption UI.
- The factory must register the Sociobot product and confirm the $12 price before release.
- No cloud sync, diagnosis, treatment advice, clinician portal, wearable data, or insurance workflow is included by design.
