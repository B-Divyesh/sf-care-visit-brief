# Repair handoff — care-visit-brief-repair-4

## Result

**PASS.** Every finding in `.factory/verification-3.md` for candidate
`a48cc69abd8271a2857d75b70983fd5bc2df6d8e` is repaired, tested, pushed, and
deployed to <https://care-visit-brief.sociobot.in>.

## Repairs

- Registered the production **Care Visit Brief** billing product as a USD
  12.00 one-time purchase and enabled its immutable Sociobot product mapping.
  The public catalog now lists `care-visit-brief`; its checkout changed from
  HTTP 404 to HTTP 303 with an HTTPS Dodo checkout-session location.
- Coalesced license checks by token. A returned license and the daily check now
  share one in-flight request instead of issuing two concurrent requests.
- Moved the `paid-unlock` claim to a fresh `/demo?license=demo-license` entry.
  Its fixture now proves one verification request, saved-token handling, six
  demo records under `demo:entries`, no `real:entries` value, cover-note
  display, and printed output.
- Removed the duplicate document-level skip link. Each SPA route now renders
  one **Skip to content** link. The standalone HTTP 404 page has the same
  keyboard path.
- Kept entry text fully opaque during the 180 ms settle motion. This removed a
  transient contrast failure while preserving the design's vertical movement.
- Made the pre-existing removal/undo checks wait for seeded IndexedDB records
  before measuring their baseline, removing a race in the test itself.
- Added `npm run test:live` to assert the production billing catalog and
  checkout redirect, invalid-license policy, security/cache policy, and
  SHA-256 identity of deployed JS/CSS against `dist/`.

## Local verification

- `npm ci`: PASS; 23 packages, 0 vulnerabilities.
- `npm test`: PASS, 26/26 Playwright tests after a production build.
- Every exact `.factory/claims.json` command was also run separately: 7/7
  PASS, one matching tagged test per command.
- `npm run build`: PASS. TypeScript project checking and Vite production build
  produced `dist/` with `index.html` at its root. There is no separate lint
  configuration in this vanilla TypeScript product.
- Final bundle: JS 27.52 KB raw / 10.02 KB gzip; CSS 10.86 KB raw / 3.25 KB
  gzip; hero WebP 50.64 KB. These remain below all supplied budgets.
- Local coverage includes malformed/corrupt restore recovery, encrypted and
  legacy backup restore, CSV formula neutralization, printable popup output,
  repeated undo, two-tab merging, 390 px targets/reflow, keyboard navigation,
  six-route Axe checks, versioned service-worker precache, waiting-worker
  update persistence, and a cold offline demo reload.
- Package/consumer, backend, authentication, AI, and native checks are not
  applicable to this static local-first PWA.

## Live verification

- Deployed with `/opt/fleet/lib/deploy-static.sh care-visit-brief
  /work/repo/dist`. Final Azure deployment ID:
  `54b05ab7-a47b-4a0b-9a22-dc94f406c9dd`.
- `npm run test:live`: PASS. The live JS and CSS SHA-256-match the local build;
  the product catalog reports USD 12.00; checkout returns HTTP 303; an invalid
  license returns HTTP 200 with `valid: false`; hashed assets are immutable;
  and `sw.js` is `no-store`.
- `/opt/fleet/lib/verify-url.sh`: PASS in 658 ms with no console errors, one
  h1, one main, `lang="en"`, a descriptive title, no missing image text, and
  no unnamed buttons.
- Live Playwright: six routes, 0 serious/critical Axe findings and 0 unexpected
  console errors. A fresh returned invalid token made exactly one verification
  request. At 390 px there was no horizontal overflow, the first action was in
  the first viewport, and the smallest visible interactive target was 44 px.
  Tab focused the skip link and Enter focused `main`.
- Live offline: PASS from a fresh context after one `/demo` visit, service
  worker readiness, browser HTTP-cache clearing, closing the warm tab, and
  opening a new tab offline. The demo banner and Aug 23 sample rendered.
- Final Lighthouse mobile: performance 100, accessibility 100, best practices
  100, SEO 100; FCP 0.8 s, LCP 1.4 s, CLS 0, TBT 40 ms, transfer 112 KiB.
- Response policy: home 200, unknown route 404, CSP and `nosniff` present,
  strict-origin referrer policy present, hashed CSS cached for one year with
  `immutable`, and the worker served `no-cache, no-store`.
- Evidence is in `.factory/verify-repair-4/`: desktop and 390 px screenshots,
  `verify.json`, the fetched shell, and the Lighthouse JSON report.

## Known gaps

No release-blocking gaps remain. A real production card was not charged during
verification. The production endpoint created a live hosted checkout session;
the token return, storage, restore, verification, cover-note, and print path is
covered by the recorded gateway fixture, while an invalid token was checked
against the live verification endpoint.
