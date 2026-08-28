# Handoff — Care Visit Brief v1 repair

## Repair status: ready to deploy

This repair resolves every release blocker reported against candidate
`107a43fd6ee41008ad5ecee18688cfd4e7fc2d6e` in
`.factory/verification.md`, without changing the researched product scope or
the existing demo, export, print, licensing, and local-first behaviour.

### What changed

- JSON restore now fully validates every backup entry before any IndexedDB
  write. It rejects the verifier's exact malformed file
  `{"version":1,"entries":[{}]}`, keeps the existing log, and announces a
  plain recovery message. A defensive render recovery screen also prevents a
  bad pre-existing local record from blanking the application.
- The PWA service worker is generated during the Vite build. Its cache name
  contains a content version, its precache includes the executing hashed JS
  and CSS plus every app route, and activation removes old Care Visit Brief
  caches. A waiting update exposes the in-app **Reload to update** action,
  which sends `SKIP_WAITING`; activation uses `clientsClaim()`.
- Navigation falls back to the precached demo/home shell offline. The offline
  claim opens the demo again immediately after the first controlled visit,
  with no extra online reload.
- Header navigation and tag controls are at least 44 × 44 CSS px at 390 px.
  Removing an entry now shows a visible ten-second Undo action and an
  announced result.
- Static Web Apps configuration now assigns `public, max-age=31536000,
  immutable` to `/assets/*` and keeps `/sw.js` revalidated.

### Regression coverage

- `invalid restore leaves the existing record intact after reload` uploads the
  verifier's exact file, checks the error and original entry, then reloads.
- `removed health records can be undone`, `390px navigation and tag buttons
  meet the 44px touch target`, and `generated service worker versions and
  precaches executing assets` cover the other repaired behaviours.
- The existing offline claim now verifies the first controlled visit. All
  declared claim commands pass individually.

### Verification evidence

Run from a clean install:

```sh
npm ci
npm test
npm run build
```

- `npm ci`: passed, 0 vulnerabilities.
- `npm test`: **17/17 Playwright tests passed**. This covers desktop,
  390 px mobile, keyboard note entry, all listed routes, axe WCAG 2 A/AA
  serious/critical checks, malformed restore/reload, Undo, touch targets,
  PWA precache/update plumbing, privacy requests, and offline reload.
- Each `.factory/claims.json` command was also run independently and passed:
  `csv-export`, `offline-reload`, `device-only`, `encrypted-backup`, `print-brief`,
  and `paid-unlock`.
- Production build passed. The initial JS is 23.91 kB (8.75 kB gzip), CSS is
  10.02 kB (3.10 kB gzip), and the hero WebP is 50,644 bytes.
- `/opt/fleet/lib/verify-url.sh` against the production preview reported
  title, `lang="en"`, one h1, one main landmark, no missing image alt text,
  and no console/page errors. Its desktop and 390 px screenshots were saved
  in `/tmp/care-visit-brief-verify/` for this worker session.
- Lighthouse mobile report: performance **100**, accessibility **100**, LCP
  **1.4 s**, CLS **0**, TBT **70 ms**. The report was written to
  `/tmp/care-visit-brief-lighthouse.json`.
- The standalone axe CLI could not locate a Chrome binary in this container;
  the repository's Playwright axe integration passed on `/`, `/log`, `/demo`,
  `/privacy`, `/terms`, and the 404 route instead.

### Deployment evidence

The static `dist/` artifact was deployed successfully on 2026-08-28 using
`/opt/fleet/lib/deploy-static.sh care-visit-brief dist` (Azure deployment
`f7106a05-709a-44ca-928a-b351d10b698d`). The production custom domain returned
200 after deployment.

- Live `/sw.js` contains cache `care-visit-brief-bf79fb08e324`, the generated
  hashed JS/CSS precache, `SKIP_WAITING`, cache cleanup, and `clientsClaim()`.
- Live `/sw.js` sends `Cache-Control: no-cache, no-store, must-revalidate`.
- Live `/assets/index-_P8_lROj.js` sends
  `Cache-Control: public, max-age=31536000, immutable`.
- The live `verify-url.sh` pass found title, language, one h1, main landmark,
  image alt text, desktop/390 px screenshots, and no console or page errors.
- A fresh live 390 px browser context saved an entry, uploaded the verifier's
  exact malformed file, and confirmed both the recovery message and preserved
  entry. The same context then cached `/demo`, went offline, reopened `/demo`,
  and displayed the demo banner and sample data with no page errors.

No product gaps are known.

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
