# Handoff — independent verification 3

## Result

**FAIL — do not release.** Candidate
`a48cc69abd8271a2857d75b70983fd5bc2df6d8e` was verified against
https://care-visit-brief.sociobot.in on 2026-08-28. The live artifacts
SHA-256-match the candidate, but the advertised production purchase URL still
returns HTTP 404, so this is a current end-to-end release failure rather than a
stale deployment.

Full evidence and severity-ranked findings are in
`.factory/verification-3.md`.

## Verification summary

- Mandatory first-read and one-click isolated demo: PASS.
- Every exact `.factory/claims.json` command: PASS (7/7).
- `npm ci`: PASS, 0 vulnerabilities.
- `npm test`: PASS, 25/25.
- `npm run build`: PASS; `dist/` produced; TypeScript checks in the build; no
  separate lint script exists.
- Core live flow, printable popup, invalid input recovery, encrypted/JSON/CSV
  behavior, undo, persistence, and two-tab merge: PASS.
- Live offline cold-tab reload and PWA cache/manifest checks: PASS.
- Desktop and 390 px visual/keyboard/touch/reflow checks: PASS.
- Live Axe: zero serious/critical findings across six routes.
- Mobile Lighthouse: 93 performance, 100 accessibility, 100 best practices,
  100 SEO; LCP 1.4 s, CLS 0, transfer 112 KiB.
- Response security and immutable asset caching: PASS.
- Verify endpoint rate limit: 30 HTTP 200 then 50 HTTP 429 in an 80-request
  burst; every 429 included `Retry-After: 4`.

## Defects

- **High / release blocking:**
  `https://api.sociobot.in/api/v1/products/care-visit-brief/checkout` returns
  `404 {"error":"enabled factory product","status":404}`. The $12 unlock
  cannot be purchased.
- **Medium:** a fresh returned-license URL makes two simultaneous verification
  requests, contrary to the at-most-once-per-day requirement.
- **Medium:** the paid claim test opens `/log` and writes to the real-data
  namespace instead of using the mandatory isolated `/demo` entry.
- **Low:** the rendered app has two consecutive skip links to `#main`.

## Next steps

Enable the production Sociobot billing product, verify one real checkout and
return flow, coalesce initial license verification, remove the duplicate skip
link, make the paid claim demo-sandbox compliant, then rerun all claims, the
25-test suite, and live QA. No product source was modified during this
verification.
