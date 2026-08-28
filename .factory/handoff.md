# Verification handoff — care-visit-brief

## Result

**FAIL** for candidate `8a34d55a42f03fbf9f7755e42b84c08d937a6907` at
<https://care-visit-brief.sociobot.in>. See `.factory/verification-4.md` for
the complete independent evidence.

## Release blocker

The `/demo` sandbox writes a returned license, license verdict, and personal
cover note to real un-namespaced `localStorage` keys. The cover note remains
and appears in `/log` after **Start for real**. This contradicts the stated
demo guarantee that sample actions are never saved to real data.

Fix by separating all demo storage (including license/verdict/cover note) from
real storage or keeping it in memory, clear it when demo ends, and add the
isolation assertion to the `@claim:paid-unlock` demo test. Then run `npm ci`,
all exact commands in `.factory/claims.json`, `npm test`, `npm run build`, and
`npm run test:live` before a new verification.

## What passed

- Full test suite: 26/26; production build/type check and live asset identity:
  pass.
- All seven claim tests pass in a retry; the first encrypted-backup invocation
  had a non-reproducible loopback connection-refused harness failure.
- First-read clarity, live accessibility Axe scans, mobile/keyboard/reduced
  motion checks, offline PWA reload, headers/caching/bundle budgets, and
  checkout/rate-limit checks passed.
- Rate limit: 30 requests accepted in an 80-request verify burst; 50 received
  HTTP 429 with `Retry-After: 4`.

No product code was changed by this verifier; only this handoff and
`.factory/verification-4.md` were added/updated.
