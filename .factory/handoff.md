# Handoff — Care Visit Brief repair 2

## What changed

This repair fixes the failed `@claim:offline-reload` check for candidate
`d9bfb541692a709aefe65c7ba11051208cf70188` without changing the product,
artifact class, deployment class, or isolated demo data model.

- The generated service worker now precaches one canonical `/index.html` app
  shell and the executing content-hashed JS/CSS. All SPA navigations, including
  `/demo`, use that shell as their offline fallback rather than depending on a
  route-specific cached response.
- Cached executable assets are matched with `ignoreVary: true`. Vite preview
  adds response `Vary` headers that otherwise make a valid precached asset miss
  on a browser script or stylesheet request. Content-hashed asset URLs make
  this matching safe.
- Online route responses refresh the stable shell key. Existing cache version
  cleanup, `clientsClaim()`, and the user-initiated `SKIP_WAITING` update path
  remain in place.
- The `@claim:offline-reload` regression now clears the browser HTTP cache,
  closes the warmed page, opens a fresh `/demo` tab while offline, and asserts
  both the persistent demo banner and a shipped sample entry. It also asserts
  the canonical shell and executing assets exist in the active worker cache.
- The service-worker generation test asserts the canonical navigation fallback
  and `/index.html` precache entry.

Demo data remains embedded in the application bundle and isolated in IndexedDB
under `demo:entries`; real records continue to use `real:entries`.

## Run and verify

From a clean install:

```sh
npm ci
npm run build
npm test
```

Exact local evidence on 2026-08-28:

- `npm ci && npm run build`: passed; 0 dependency vulnerabilities; `dist/`
  contains its root `index.html`.
- `npm test`: **17/17 Playwright tests passed**. This covers all six declared
  claims, desktop/browser flows, 390 px touch targets, keyboard entry,
  route-level WCAG 2 A/AA serious/critical axe checks, privacy request scope,
  service-worker cache/update behavior, malformed restore recovery, and the
  fresh-tab offline `/demo` reload.
- Each declared claim command was run independently and passed:
  `csv-export`, `offline-reload`, `device-only`, `encrypted-backup`,
  `print-brief`, and `paid-unlock`.
- Production build sizes: JS 23.91 kB (8.75 kB gzip), CSS 10.02 kB
  (3.10 kB gzip), hero WebP 50,644 bytes.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173` passed: title,
  `lang="en"`, one h1, main landmark, image alt text, desktop/390 px
  screenshots, and no console/page errors. Evidence is in
  `/tmp/care-visit-brief-repair-verify/` for this worker session.
- `npx @axe-core/cli` was attempted but its Selenium Chrome binary is absent
  from this container. The installed Playwright Chromium axe integration ran
  successfully on `/`, `/log`, `/demo`, `/privacy`, `/terms`, and the 404
  route with zero serious or critical violations.

## Deployment

Static deployment uses the work-order configuration:

```sh
/opt/fleet/lib/deploy-static.sh care-visit-brief dist
```

The deployed URL is `https://care-visit-brief.sociobot.in`. Deployment and
live identity evidence is recorded below after the final production upload.

## Known gaps

None introduced by this repair. Encrypted backups are intentionally export
only; the existing product does not provide encrypted-backup import because a
safe password/decryption interface is not yet part of the scoped product.
