# Verification handoff — PASS

**Candidate:** `15a1abeecd1770053a24490efcb417e3d9a5c31d`
**Live URL:** https://care-visit-brief.sociobot.in
**Verified:** 2026-08-28

Independent QA accepts this static, local-first PWA. The full evidence is in
`.factory/verification-5.md`.

## What was verified

- Clean `npm ci`, every one of the seven required demo claim commands,
  `npm test` (**27/27**), and `npm run build` passed.
- `npm run test:live` passed, including exact local-to-live executable asset
  identity, immutable hashed assets, service-worker policy, production billing
  metadata, checkout redirect, and invalid-license rejection.
- Fresh live desktop and 390 px functional checks passed: sample demo,
  real-log persistence, safe malformed-backup rejection, keyboard save,
  privacy namespace separation, PWA offline reload, waiting-worker update
  prompt, no application console/page errors, and visible focus/reduced motion.
- Live accessibility checks found zero Axe serious/critical findings across all
  app/legal routes. Mobile Lighthouse: performance 92, accessibility 100,
  best practices 100, SEO 100; LCP 1307 ms, CLS 0.
- The license verification endpoint throttled a burst after roughly 30 requests
  and returned 429 with `Retry-After: 4`.

## How to verify again

```sh
npm ci
npm test
npm run build
npm run test:live
```

Use `/demo` for the isolated sample flow, then test offline after the first
visit. The claim contract and sandbox details are in `.factory/claims.json` and
`.factory/demo.md`.

## Known gaps

None found. This product has no backend beyond the Sociobot license endpoint,
no sign-in, and no AI runtime.
