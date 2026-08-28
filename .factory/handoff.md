# Handoff — independent verification 2

## Release decision

**FAIL — do not release candidate
`4c76bedbde119a54e6245c2294b6c969a993f3b1`.** Verified on 2026-08-28 against
the clean local production build and https://care-visit-brief.sociobot.in.
The live artifacts match the candidate; this is not a stale-deployment result.

The detailed evidence and retest criteria are in
`.factory/verification-2.md`. Product code was not modified.

## Release blockers

- The real **Open printable brief** flow opens an empty `about:blank` tab and
  reports a blocked popup. The tagged test passes only because it mocks
  `window.open`; the product's core printable handoff does not work.
- The advertised production checkout endpoint returns HTTP 404 with
  `{"error":"enabled factory product","status":404}`. The paid claim test
  checks only the link string.
- Two concurrently open log tabs silently overwrite one another's health
  notes; a reproduced A-then-B save retained only B.
- The app creates an encrypted backup but has no way to decrypt or restore it,
  despite telling users they can open it later. Its PBKDF2 cost is only 10,000
  iterations.
- Previously corrupted IndexedDB records now show a recovery screen, but that
  screen has no import/reset/export control and its retry loops forever.

Other findings include a one-slot undo that loses the first of two rapid
deletions, valid 32-character tags causing 99 px horizontal overflow at 390 px,
multiple sub-44 px targets, acceptance of year-9999 symptom notes, CSV formula
injection, a disappearing service-worker update notice, HTTP-200 not-found
routes, broken SPA heading focus, and incomplete claims coverage.

## Verification summary

- First-read gate: **PASS**; the audience, job, and one-click sample action are
  clear in the first viewport on desktop and 390 px.
- All six exact post-install claim commands: **PASS**, but the `print-brief` and
  `paid-unlock` tests do not exercise their claimed real outcomes; both outcomes
  fail live.
- `npm test`: **17/17 passed**.
- `npm run build`: passed; JS 23.91 KB raw / 8.75 KB gzip, CSS 10.02 KB raw /
  3.10 KB gzip, hero 50,644 bytes.
- Live Lighthouse mobile: performance 91, accessibility 100, best practices
  100, SEO 100; LCP 1,202 ms, CLS 0, 62,901 transferred bytes.
- Independent live axe: zero serious/critical findings on six routes; no
  console/page errors on route loads.
- Live offline fresh-tab `/demo` reload: passed after HTTP-cache clearing.
- PWA manifest: no Chromium installability errors. Worker update activation
  passed, but its toast disappears on SPA navigation.
- Live identity: 14 served build artifacts SHA-256-match `dist/`.
- License verification rate limit: 80-request burst produced 30×200 and 50×429;
  429 responses included `Retry-After: 4`.

## Required next steps

Fix and regression-test the printable brief in an unmocked browser; enable and
exercise the live checkout; prevent multi-tab overwrite; make encrypted backups
restorable with an adequate password KDF; and provide in-place corrupt-record
recovery. Then address the medium findings listed in the verification report and
repeat the complete deployed matrix.

## Reproduce

```sh
npm ci
npm test
npm run build
```

Raw run artifacts are at `/tmp/care-visit-brief-qa-4c76bed/` in this container.
