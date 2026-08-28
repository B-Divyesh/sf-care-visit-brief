# Adversarial first-read review 3 — Care Visit Brief

**Verdict: FAIL**

**Reviewed:** 2026-08-28

**Live site:** <https://care-visit-brief.sociobot.in>

**Review checkout:** `0efb1d1c84988c0462faadd8d161dff2e9a62dd1`

The product is clear on first read, opens a useful sample in one click, keeps
demo changes out of the real timeline, and passes every registered claim.
The review still fails because earlier finding F-1-22 was only partly fixed:
the README retains unexplained deployment jargon that the finding quoted.
Five additional plain-word findings remain in landing, README, and 404 copy.

## Findings

### Blocking

#### F-1-22 — Reopened: README deployment jargon was only partly removed

- **Exact quote/location:** `README.md`, **Develop and verify**: “After
  deployment, `npm run test:live` checks billing, response policy, route
  metadata, the 404 page, and deployed asset identity.”
- **Why this remains open:** Review 1 identified “response policy” and
  “deployed asset identity” as vague developer jargon. Both phrases remain in
  the current README. “Route metadata” adds another compressed term. The
  polish records and review 2 marked F-1-22 fixed, but the live checkout does
  not confirm that closure. A reader cannot tell which response behavior,
  route information, or identity is checked.
- **Concrete fix:** Replace the sentence with: “After deployment, `npm run
  test:live` checks the price, security headers, page titles and URLs, the 404
  page, and built-file hashes.” Keep the claim test aligned with those named
  outcomes.

### Minor

#### F-3-1 — “Mark the day” does not name the step

- **Exact quote/location:** Landing **How it works** heading: “Mark the day.”
- **Why this is unclear:** In a heading list, “mark” does not say that the
  person chooses symptom severity. It could describe a calendar action.
- **Concrete fix:** Use **“Choose the day’s severity.”**

#### F-3-2 — “Leave gaps alone” uses an undefined metaphor

- **Exact quote/location:** Landing **How it works** heading: “Leave gaps
  alone.”
- **Why this is unclear:** “Gaps” does not name days without notes when the
  heading is read out of context.
- **Concrete fix:** Use **“Leave days without notes blank.”**

#### F-3-3 — The hero image caption is generic advice

- **Exact quote/location:** Landing hero figure caption: “Keep only the
  details you may need later.”
- **Why this is unclear:** “Details” and “later” do not identify what to record
  or when it helps. The sentence could appear unchanged on an unrelated notes
  product.
- **Concrete fix:** Use **“Record only details you may want to discuss with a
  clinician.”**

#### F-3-4 — “Use it” is a contextless README heading

- **Exact quote/location:** `README.md` heading: “Use it.”
- **Why this is unclear:** A heading list does not identify what “it” refers
  to or what the section contains.
- **Concrete fix:** Use **“Use Care Visit Brief.”**

#### F-3-5 — The 404 headline describes a metaphor, not the error

- **Exact quote/location:** Live `/missing-page` and `public/404.html` h1:
  “This page is not in the notebook.”
- **Why this is unclear:** “Notebook” is visual brand language, not the name of
  a route or stored object. The smaller eyebrow says “Page not found,” but the
  required h1 does not name the error plainly.
- **Concrete fix:** Make the h1 **“We could not find this page.”** Keep “Return
  to your timeline or try the sample” as the recovery instruction.

## Cold first read

Fresh browser contexts had no storage and blocked service workers. Nothing was
scrolled before recording the answers.

| View | What it does, in my words | For whom | First click | Result |
|---|---|---|---|---|
| 390 × 844 | Saves symptom notes and prints them as a visit brief. | People whose symptoms change between appointments. | **Try it with sample data** | Pass |
| 1440 × 900 | Saves symptom notes and prints them as a visit brief. | People whose symptoms change between appointments. | **Try it with sample data** | Pass |

The exact first-screen text was “Turn symptom notes into a visit brief,” “For
people with changing symptoms, build a short timeline to print for a
clinician,” and “Try it with sample data.” On mobile the three facts also ended
at 721 px, inside the 844 px viewport. No first-read blocking finding exists.

## Copy audit

Counts use whitespace-separated words; numbers and hyphenated terms count as
one word. Commands count each shell token. The live landing was read with an
empty real timeline. No sentence exceeds 22 words, and no banned marketing
adjective appears.

### Landing sentences

| Exact sentence | Words | Result |
|---|---:|---|
| For people with changing symptoms, build a short timeline to print for a clinician. | 14 | Pass |
| Open a filled sample timeline. | 5 | Pass |
| Your notes stay untouched. | 4 | Pass; `demo-isolation` |
| Keep only the details you may need later. | 8 | **F-3-3** |
| An open ruled notebook, pencil, and blank note paper on a desk. | 12 | Pass; image alt |
| Save a severity number, optional tags, and a short note. | 10 | Pass; `daily-note-fields` |
| This timeline does not diagnose, interpret symptoms, recommend treatment, or contact a clinician. | 13 | Pass; `safety-boundary` |
| Your notes will appear here. | 5 | Pass |
| Start with a severity number. | 5 | Pass |
| You do not need to fill every field. | 8 | Pass |
| Choose a date range. | 4 | Pass |
| The print view uses only your saved notes. | 8 | Pass; `print-brief` |
| If the notes need more than one page, choose a shorter range. | 12 | Pass; `print-brief` |
| Choose a password. | 3 | Pass |
| You need it to restore this backup later. | 8 | Pass; `encrypted-backup` |
| Choose a severity number. | 4 | Pass |
| Add only tags that matter. | 5 | Pass |
| No missed-day warning appears. | 4 | Pass; `blank-days` |
| Blank days remain blank. | 4 | Pass; `blank-days` |
| Print a short chronology before your next visit. | 8 | Pass |
| Care Visit Brief stores notes in this browser. | 8 | Pass; `device-only` |
| It does not diagnose, interpret symptoms, recommend treatment, or contact a clinician. | 12 | Pass; `safety-boundary` |
| For urgent symptoms or immediate danger, contact local emergency services. | 10 | Pass |
| Pay $12 USD once to add a personal cover note. | 10 | Pass; `paid-unlock` |
| Your timeline, exports, print tools, and safety information stay free. | 9 | Pass; `free-core` |
| Care Visit Brief turns daily notes into a printable visit brief. | 11 | Pass |
| Illustration generated for this product. | 5 | Pass |

### Landing headings, labels, and actions

| Exact copy | Words | Result |
|---|---:|---|
| Skip to content / Care Visit Brief / My timeline / Demo / Privacy | 3 / 3 / 2 / 1 / 1 | Pass |
| Private symptom notes for appointments | 5 | Pass |
| Turn symptom notes into a visit brief | 7 | Pass |
| Try it with sample data | 5 | Pass |
| Notes stay on this device / Works offline after your first visit / $12 USD once; the timeline stays free | 5 / 6 / 7 | Pass; registered claims |
| Daily note / Record what changed | 2 / 3 | Pass |
| Date / How hard was it today? | 1 / 5 | Pass |
| None / Mild / Noticeable / Hard / Severe | 1 each | Pass; choice labels |
| Symptoms optional / Possible triggers optional / Medicine changes optional | 2 / 3 / 3 | Pass |
| Headache / Fatigue / Nausea / Pain / Poor sleep / Stress / Food / Activity | 1–2 each | Pass; choice labels |
| New dose / As needed / Missed dose / Add your own | 2 / 2 / 2 / 3 | Pass |
| What changed? optional / Save today’s note | 3 / 3 | Pass |
| Your timeline / Saved notes | 2 / 2 | Pass |
| Printable visit brief / Make a visit brief | 3 / 4 | Pass |
| From / To / Open one-page visit brief / Export CSV / Export backup | 1 / 1 / 4 / 2 / 2 | Pass |
| Make an encrypted backup / Backup password / Download encrypted backup | 4 / 2 / 3 | Pass |
| Restore from a backup / Password for an encrypted backup | 4 / 5 | Pass |
| Mark the day | 3 | **F-3-1** |
| Leave gaps alone | 3 | **F-3-2** |
| Bring the visit brief | 4 | Pass |
| Notes, not medical advice | 4 | Pass |
| One-time unlock / Add a cover note to printed briefs | 2 / 7 | Pass |
| Buy the $12 unlock / Have a license? / Restore my unlock | 4 / 3 / 3 | Pass; result and purchase context are adjacent |
| Privacy / Terms / Built by Param Factory / v1.1.0 | 1 / 1 / 4 / 1 | Pass |

### README

| Exact sentence, heading, or command | Words | Result |
|---|---:|---|
| Care Visit Brief | 3 | Pass |
| Care Visit Brief turns daily symptom notes into a printable visit brief. | 12 | Pass |
| It is for people whose symptoms change between appointments. | 9 | Pass |
| A note saves a severity number, symptom tags, possible triggers, medicine changes, and your words. | 15 | Pass; `daily-note-fields` |
| Notes stay in this browser. | 5 | Pass; `device-only` |
| The app uses no analytics. | 5 | Pass; `device-only` |
| It works offline after your first visit. | 7 | Pass; `offline-reload` |
| The app does not diagnose, interpret symptoms, recommend treatment, or contact a clinician. | 13 | Pass; `safety-boundary` |
| Use it | 2 | **F-3-4** |
| Open `/?demo=1` to see five sample notes without changing your real timeline. | 12 | Pass; `demo-isolation` |
| Use Reset demo to restore the sample. | 7 | Pass; `demo-isolation` |
| Use Start my private timeline to discard it. | 8 | Pass; `demo-isolation` |
| Open `/log` to start your private timeline. | 7 | Pass |
| Days without a note stay blank. | 6 | Pass; `blank-days` |
| Use Open one-page visit brief before an appointment. | 8 | Pass; `print-brief` |
| Shorten the date range if the notes need another page. | 10 | Pass; `print-brief` |
| Use Export CSV for a table. | 6 | Pass; `csv-export` |
| Use Export backup for a versioned JSON copy. | 8 | Pass; `json-backup` |
| Use Download encrypted backup for a password-protected copy. | 8 | Pass; `encrypted-backup` |
| Restore it with the same password. | 6 | Pass; `encrypted-backup` |
| New encrypted backups use 600,000 PBKDF2 iterations. | 7 | Pass; exact security term is needed by `encrypted-backup` |
| Backups from the earlier 10,000-iteration release also restore. | 8 | Pass; `encrypted-backup` |
| Make a new backup afterward. | 5 | Pass |
| Develop and verify | 3 | Pass |
| `npm ci` / `npm run dev` / `npm test` / `npm run build` / `npm run test:live` | 2 / 3 / 2 / 3 / 3 | Pass; commands |
| The production build creates `dist/index.html`. | 5 | Pass; `build-output` |
| Deploy the `dist/` folder as a static site. | 8 | Pass |
| The included config serves app routes and the custom 404 page. | 11 | Pass; `deployment-config` |
| It also caches versioned assets and adds security headers. | 9 | Pass; `deployment-config` |
| The claim registry is `.factory/claims.json`. | 5 | Pass |
| Each product claim names its exact test command and clean sandbox. | 11 | Pass; defined by the repository contract |
| After deployment, `npm run test:live` checks billing, response policy, route metadata, the 404 page, and deployed asset identity. | 18 | **F-1-22 reopened** |
| Optional one-time purchase | 3 | Pass |
| Saving, restoring, exports, print tools, and safety information need no license. | 11 | Pass; `free-core` |
| Pay $12 USD once to add a printed cover note. | 10 | Pass; `paid-unlock` |
| Sociobot and Dodo are the merchant of record. | 8 | Pass; `billing-policy` |
| License restoration sends only the entered token to Sociobot. | 9 | Pass; `license-data-boundary` |
| Paste the same token on another device to restore the cover-note feature. | 12 | Pass; `license-restore` |
| Your health notes do not move with the token. | 9 | Pass; `license-restore` |
| Privacy and terms | 3 | Pass |
| Read the privacy page for local storage and license checks. | 10 | Pass |
| Read the terms for safety and purchase terms. | 8 | Pass |
| License / MIT. / See LICENSE. | 1 / 1 / 2 | Pass |

### Terminology

| Concept | Term used | Result |
|---|---|---|
| One saved day | note | Consistent |
| Collection | timeline | Consistent |
| Printed output | visit brief | Consistent |
| Medicine field | medicine changes | Consistent |
| Paid field | cover note | Consistent |
| Portable file | backup | Consistent |

## Demo and sandbox

- One click on **Try it with sample data** opened `/?demo=1`.
- At 390 × 844, the realistic latest sample occupied y=496–687 in the first
  viewport. The persistent banner, **Reset demo**, and **Start my private
  timeline** were present.
- The sample contained five dated notes. Removing one produced four; Reset
  restored five and removed a newly added demo-only note.
- A real note named **REAL REVIEW 3 NOTE** was saved first. Demo mutation and
  Reset left it in `real:entries`; exit removed `demo:entries` and every
  `demo:` localStorage key, then displayed the real note on `/log`.
- The live demo/save/export exercise contacted only
  `https://care-visit-brief.sociobot.in`. No analytics or third-party request
  occurred.
- After the live service worker warmed the demo, Chromium cleared its HTTP
  cache, went offline, and opened the demo in a new tab. The banner and sample
  note still loaded.

No demo or sandbox finding exists.

## Claims audit

A new temporary clone ran `npm ci`, then every exact `test` command from
`.factory/claims.json` separately. All 19 passed. The live-deployment command
reported “Live release checks passed for
https://care-visit-brief.sociobot.in”. No claim-like landing or README sentence
is absent from the registry.

| Claim | Exact command result |
|---|---|
| `csv-export` | Pass, 1 test |
| `offline-reload` | Pass, 1 test |
| `device-only` | Pass, 1 test |
| `encrypted-backup` | Pass, 1 test |
| `print-brief` | Pass, 1 test; generated PDF is one A4 page |
| `json-backup` | Pass, 1 test |
| `demo-first-screen` | Pass, 1 test |
| `daily-note-fields` | Pass, 1 test |
| `blank-days` | Pass, 1 test |
| `safety-boundary` | Pass, 1 test |
| `free-core` | Pass, 1 test |
| `demo-isolation` | Pass, 1 test |
| `paid-unlock` | Pass, 1 test; fixture asserts 1,200 minor units, USD, and one-time billing |
| `license-data-boundary` | Pass, 1 test |
| `license-restore` | Pass, 1 test |
| `billing-policy` | Pass, 1 test |
| `build-output` | Pass, 1 test |
| `deployment-config` | Pass, 1 test |
| `live-deployment` | Pass, 1 test with `LIVE_CLAIM=1` |

The ordinary full suite also passed: **41 passed, 1 deployment-only skip**.
The build produced `dist/index.html`; shipped JavaScript is 32.52 KB raw and
11.52 KB gzip.

## Structure, accessibility, links, and identity

- `/`, `/log`, `/?demo=1`, `/demo`, `/privacy`, and `/terms` returned 200.
  `/missing-page` returned a designed HTTP 404. The checkout endpoint returned
  303 to an HTTPS Dodo checkout that returned 200.
- Every route had `lang="en"`, one h1, one main, a skip link, header, footer,
  Privacy and Terms links, a route-specific title, description, canonical, OG
  and Twitter metadata, favicon, and Apple touch icon. The 404 has the same
  shell; its headline wording is F-3-5.
- All internal links returned their intended 200 status, except the deliberate
  unknown route at 404. Robots, sitemap, manifest, icons, and social image
  returned 200.
- SPA navigation focused and announced the destination h1. On live mobile,
  Back restored `/log` to y=320 and `/` to y=900; Forward restored `/log` to
  y=320. The route h1 was focused each time.
- Independent Axe WCAG 2 A/AA scans found zero violations on all seven routes.
  Normal routes produced no console or page errors. The unknown URL produced
  only the browser's expected failed-resource message for its HTTP 404.
- The warm paper, blue-black ink, oxide rules, clipped sheets, serif headings,
  and original notebook still life match `.factory/design.md`. The result is
  recognizably product-specific and not a generic SaaS template.

## Earlier-history verification

Every finding in reviews 1 and 2 was checked against current source, live
behavior, and its specific regression test where one exists.

| Earlier finding | Current verification | Status |
|---|---|---|
| F-1-1 | Live sample preview is inside the initial mobile viewport; `demo-first-screen` passes. | Fixed |
| F-1-2 | `print-brief` renders the five-note sample as one A4 page and warns on overflow. | Fixed |
| F-1-3 | `paid-unlock` asserts USD 12, 1,200 minor units, and `one_time`; live catalog check passes. | Fixed |
| F-1-4 | `demo-first-screen` is registered and passed. | Fixed |
| F-1-5 | `daily-note-fields` saves, reloads, and prints every named field. | Fixed |
| F-1-6 | `blank-days` confirms no generated days or missed-day warning. | Fixed |
| F-1-7 | `print-brief` excludes unsaved and out-of-range text. | Fixed |
| F-1-8 | `safety-boundary` preserves exact user text and makes no clinician request. | Fixed |
| F-1-9 | `free-core` exercises save, restore, exports, encryption, print, and safety without a license. | Fixed |
| F-1-10 | Live and local isolation checks preserve `real:entries` through demo Reset and exit. | Fixed |
| F-1-11 | `encrypted-backup` asserts 600,000 new and 10,000 legacy iterations and restores both. | Fixed |
| F-1-12 | `license-data-boundary` asserts the exact token-only Sociobot request. | Fixed |
| F-1-13 | `license-restore` uses two clean contexts and transfers no health note. | Fixed |
| F-1-14 | `billing-policy` checks merchant wording and a revoked fixture. | Fixed |
| F-1-15 | `build-output` confirms `dist/index.html`. | Fixed |
| F-1-16 | `deployment-config` checks rewrites, cache policy, headers, and the 404. | Fixed |
| F-1-17 | `live-deployment` passed against production and matching local assets. | Fixed |
| F-1-18 | All live deep routes expose their own title, canonical, OG, and Twitter values. | Fixed |
| F-1-19 | The live HTTP 404 has the standard shell, metadata, favicon, and legal links. | Fixed |
| F-1-20 | Paid heading is “Add a cover note to printed briefs.” | Fixed |
| F-1-21 | Note, timeline, visit brief, and medicine changes are used consistently. | Fixed |
| F-1-22 | Product-facing “field notes” and “handoff” were removed, but README still says “response policy” and “deployed asset identity.” | **Reopened, blocking** |
| F-1-23 | No README sentence exceeds 22 words. | Fixed |
| F-1-24 | Earlier “enough,” “useful,” and maintenance claims are absent. | Fixed |
| F-1-25 | Demo and license actions now say “Start my private timeline” and “Restore my unlock.” | Fixed |
| F-2-1 | Source stores scroll coordinates; live Back/Forward restored 900/320 px with h1 focus. | Fixed |

## Missed leverage

No missed feature finding. The product includes the implied local daily note,
blank-day-safe timeline, printable one-page brief, CSV export, JSON and
encrypted backup/restore, and optional license restoration. Sync would
conflict with the local-first privacy boundary unless it were an explicit new
product choice. An AI summary is not expected for this deterministic,
sensitive health-note task; it would add disclosure and error risk without
being needed for the core job.

## What would make this perfect

Replace the five new vague or metaphorical phrases and rewrite the reopened
README deployment sentence in concrete terms. Then repeat the complete copy
scan and claim-to-copy cross-check. The functional demo, sandbox, claims,
routing, accessibility, and visual identity need no other change based on this
round.
