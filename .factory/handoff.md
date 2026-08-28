# Repair handoff — care-visit-brief

## Repair completed

This repair addresses the release blocker from `.factory/verification-4.md`
for candidate `8a34d55a42f03fbf9f7755e42b84c08d937a6907`.

`/demo` now keeps every demo-only local value in the `demo:` namespace:

- `demo:sb_license:care-visit-brief`
- `demo:sb_license_verdict:care-visit-brief`
- `demo:care-visit-brief:cover-note`

**Start for real** removes those keys and the `demo:entries` IndexedDB record
before opening `/log`. The real `sb_license:*` and cover-note keys are never
read or changed in demo mode. A session guard also prevents a slow demo
license-verification response from recreating discarded demo state after the
visitor leaves the sandbox.

The Playwright server now uses the fixed, strict port 4173 and does not reuse a
previous process. This makes a normal clean claim invocation start a fresh
server instead of silently sharing an unknown one.

## Regression coverage

`@claim:paid-unlock` now starts with a deliberately locked real license and a
real cover note, enters `/demo?license=demo-license` with a recorded valid
Sociobot response, and proves that:

1. demo mode does not read the locked real verdict or real cover note;
2. the returned token, verdict, and typed cover note are demo-namespaced;
3. the printable demo brief includes the demo cover note;
4. **Start for real** clears all demo local keys and sample entries; and
5. the real locked state remains unchanged.

An additional test holds the verification response until after **Start for
real** and proves that a late response cannot restore demo state.

## Verification evidence

- `npm ci`: passed; 23 packages installed, 0 vulnerabilities.
- `npm test`: passed, **27/27** Playwright tests. This includes desktop,
  390px mobile/touch targets, keyboard save/navigation, WCAG 2 A/AA Axe scans
  for all shipped routes, privacy/network capture, offline reload, service
  worker update, recovery, and static-route policy coverage.
- Every command listed in `.factory/claims.json` passed from the clean install:
  CSV export, offline reload, device-only network isolation, encrypted backup,
  printable brief, JSON backup, and paid unlock.
- `npm run build`: passed; `dist/index.html` exists. The produced JS is
  27.92 KB raw / 10.18 KB gzip; CSS is 10.86 KB raw / 3.25 KB gzip.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173`: passed with title,
  `lang=en`, one `h1`, one main landmark, no missing image alt text, no
  unlabeled buttons, and no console/page errors. Artifacts are in
  `.factory/verify-repair-5/local/`.
- Local mobile Lighthouse: performance **100**, accessibility **100**, LCP
  **1355.81 ms**, CLS **0**.

The pre-deploy `npm run test:live` correctly found that the currently live
site still serves the previous executable asset. Run the same command after
deployment to confirm byte identity, production billing routing, CSP/cache
headers, and invalid-license handling.

## Deployment and known gaps

The artifact remains a static Vite TypeScript PWA deployed from `dist/`. No
backend, consumer package, login, or AI runtime is part of this product.

Deployment and post-deploy live evidence will be appended after this committed
repair is uploaded. No product behavior that passed independent verification
was removed.
