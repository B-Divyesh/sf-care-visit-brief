# Adversarial first-read review 2 — Care Visit Brief

**Verdict: FAIL**

**Reviewed:** 2026-08-28  
**Live site:** <https://care-visit-brief.sociobot.in>  
**Review checkout:** \`1df58d951c91e6acc1cf82c297e61245544120bb\`

There is one blocking routing regression. All other checks in this full from-scratch review passed, including the cold first read, populated demo, storage isolation, every registered claim command, links, metadata, and Axe.

## Findings

### Blocking

#### F-2-1 — Browser Back loses the reader’s landing-page position

- **Quote/location:** The site-structure requirement requires that “back/forward restore scroll and focus.” In the deployed source, \`src/main.ts:105\` defines \`navigate()\` as \`history.pushState({}, '', path); window.scrollTo(0, 0);\`. There is no per-history-entry scroll state and the \`popstate\` handler only calls \`render(true)\`.
- **Reproduction:** In a fresh 390 × 844 context, load \`/\`, scroll to 900 px, click **My timeline**, then press browser Back. The destination heading is correctly focused, but \`/\` returns at \`scrollY = 0\`, not 900. This was reproduced on the live site.
- **Why this fails:** Someone who opened a form, the safety information, or purchase details on the landing page loses their place after checking the timeline. This is broken history behaviour, not merely a visual preference. The earlier polish handoff says Back restored 1,200 px; the current live behaviour and source do not confirm that assertion.
- **Concrete fix:** Before \`pushState\`, replace the current history state with its current scroll coordinates. Push a new state for the destination. On \`popstate\`, render, restore the saved coordinates after the render, and focus the new \`<h1>\` with \`preventScroll: true\`. Add a Playwright regression that scrolls \`/\`, uses an in-app route, goes Back and Forward, and asserts both route-specific focus and the saved scroll coordinates.

## Cold first read

Fresh browser contexts, no existing storage, were tested before scrolling.

| View | What it does in my words | For whom | What I would click first | Result |
|---|---|---|---|---|
| 390 × 844 | Saves symptom notes and prints them as a visit brief. | People whose symptoms change between appointments. | **Try it with sample data**. | Pass |
| 1440 × 900 | Saves symptom notes and prints them as a visit brief. | People whose symptoms change between appointments. | **Try it with sample data**. | Pass |

The exact first-screen text that answers the questions is “Turn symptom notes into a visit brief,” “For people with changing symptoms, build a short timeline to print for a clinician,” and “Try it with sample data.” No first-read blocking finding was found.

## Copy audit

Word counts treat a hyphenated term, number, URL, or code path as one word. The landing list includes headings, labels, actions, and sentences so a screen-reader heading/action list is also checked. No entry exceeds 22 words, uses a banned marketing adjective, is jargon in its displayed context, uses inconsistent terminology, or has a non-result-naming action. Therefore there is no copy finding in this round.

### Landing page

| Copy | Words | Result |
|---|---:|---|
| Private symptom notes for appointments | 5 | Pass |
| Turn symptom notes into a visit brief | 7 | Pass |
| For people with changing symptoms, build a short timeline to print for a clinician. | 13 | Pass |
| Try it with sample data | 5 | Pass |
| Open a filled sample timeline. | 5 | Pass |
| Your notes stay untouched. | 4 | Pass |
| Notes stay on this device | 5 | Pass |
| Works offline after your first visit | 6 | Pass |
| $12 USD once; the timeline stays free | 7 | Pass |
| Keep only the details you may need later. | 8 | Pass |
| Daily note / Record what changed | 2 / 3 | Pass |
| Save a severity number, optional tags, and a short note. | 10 | Pass |
| Date / How hard was it today? | 1 / 5 | Pass |
| None / Mild / Noticeable / Hard / Severe | 1 each | Pass |
| Symptoms optional / Possible triggers optional / Medicine changes optional | 2 / 3 / 3 | Pass |
| Headache / Fatigue / Nausea / Pain / Poor sleep / Stress / Food / Activity | 1–2 each | Pass |
| New dose / As needed / Missed dose / Add your own | 2 / 2 / 2 / 3 | Pass |
| What changed? optional / Save today’s note | 3 / 3 | Pass |
| This timeline does not diagnose, interpret symptoms, recommend treatment, or contact a clinician. | 13 | Pass; \`safety-boundary\` |
| Your timeline / Saved notes | 2 / 2 | Pass |
| Your notes will appear here. | 5 | Pass |
| Start with a severity number. | 5 | Pass |
| You do not need to fill every field. | 8 | Pass |
| Printable visit brief / Make a visit brief | 3 / 4 | Pass |
| Choose a date range. | 4 | Pass |
| The print view uses only your saved notes. | 8 | Pass; \`print-brief\` |
| If the notes need more than one page, choose a shorter range. | 12 | Pass; \`print-brief\` |
| Open one-page visit brief / Export CSV / Export backup | 4 / 2 / 2 | Pass |
| Make an encrypted backup / Restore from a backup | 4 / 4 | Pass; \`encrypted-backup\` |
| Choose a password. | 3 | Pass |
| You need it to restore this backup later. | 8 | Pass; \`encrypted-backup\` |
| Mark the day | 3 | Pass |
| Choose a severity number. | 4 | Pass |
| Add only tags that matter. | 5 | Pass |
| Leave gaps alone | 3 | Pass |
| No missed-day warning appears. | 4 | Pass; \`blank-days\` |
| Blank days remain blank. | 4 | Pass; \`blank-days\` |
| Bring the visit brief | 4 | Pass |
| Print a short chronology before your next visit. | 8 | Pass |
| Notes, not medical advice | 4 | Pass |
| Care Visit Brief stores notes in this browser. | 8 | Pass; \`device-only\` |
| It does not diagnose, interpret symptoms, recommend treatment, or contact a clinician. | 12 | Pass; \`safety-boundary\` |
| For urgent symptoms or immediate danger, contact local emergency services. | 10 | Pass |
| One-time unlock / Add a cover note to printed briefs | 2 / 7 | Pass |
| Pay $12 USD once to add a personal cover note. | 10 | Pass; \`paid-unlock\` |
| Your timeline, exports, print tools, and safety information stay free. | 10 | Pass; \`free-core\` |
| Buy the $12 unlock / Have a license? / Restore my unlock | 4 / 3 / 3 | Pass |
| Care Visit Brief turns daily notes into a printable visit brief. | 10 | Pass |
| Illustration generated for this product. | 5 | Pass |

### Demo first screen

| Copy | Words | Result |
|---|---:|---|
| Demo — sample data, nothing is saved | 6 | Required banner; pass |
| Reset demo / Start my private timeline | 2 / 4 | Pass |
| Sample that cannot change your notes | 6 | Pass |
| Review a filled sample timeline | 6 | Pass |
| Five sample notes show the printable timeline before you add anything. | 11 | Pass; \`demo-first-screen\` |
| Latest sample note | 3 | Pass |
| Aug 23, 2026 · Severity 4/4 | 5 | Pass |
| Worse than usual after two poor nights. | 7 | Pass |
| Add another note | 3 | Pass |

### README

| Sentence or heading | Words | Result |
|---|---:|---|
| Care Visit Brief | 3 | Pass |
| Care Visit Brief turns daily symptom notes into a printable visit brief. | 10 | Pass |
| It is for people whose symptoms change between appointments. | 9 | Pass |
| A note saves a severity number, symptom tags, possible triggers, medicine changes, and your words. | 15 | Pass; \`daily-note-fields\` |
| Notes stay in this browser. | 5 | Pass; \`device-only\` |
| The app uses no analytics. | 5 | Pass; \`device-only\` |
| It works offline after your first visit. | 7 | Pass; \`offline-reload\` |
| The app does not diagnose, interpret symptoms, recommend treatment, or contact a clinician. | 13 | Pass; \`safety-boundary\` |
| Use it | 2 | Pass |
| Open \`/?demo=1\` to see five sample notes without changing your real timeline. | 11 | Pass; \`demo-isolation\` |
| Use Reset demo to restore the sample. | 7 | Pass; \`demo-isolation\` |
| Use Start my private timeline to discard it. | 8 | Pass; \`demo-isolation\` |
| Open \`/log\` to start your private timeline. | 7 | Pass |
| Days without a note stay blank. | 6 | Pass; \`blank-days\` |
| Use Open one-page visit brief before an appointment. | 8 | Pass; \`print-brief\` |
| Shorten the date range if the notes need another page. | 10 | Pass; \`print-brief\` |
| Use Export CSV for a table. | 6 | Pass; \`csv-export\` |
| Use Export backup for a versioned JSON copy. | 8 | Pass; \`json-backup\` |
| Use Download encrypted backup for a password-protected copy. | 8 | Pass; \`encrypted-backup\` |
| Restore it with the same password. | 6 | Pass; \`encrypted-backup\` |
| New encrypted backups use 600,000 PBKDF2 iterations. | 7 | Pass; \`encrypted-backup\` |
| Backups from the earlier 10,000-iteration release also restore. | 9 | Pass; \`encrypted-backup\` |
| Make a new backup afterward. | 5 | Pass |
| Develop and verify | 3 | Pass |
| The production build creates \`dist/index.html\`. | 5 | Pass; \`build-output\` |
| Deploy the \`dist/\` folder as a static site. | 7 | Pass |
| The included config serves app routes and the custom 404 page. | 11 | Pass; \`deployment-config\` |
| It also caches versioned assets and adds security headers. | 9 | Pass; \`deployment-config\` |
| The claim registry is \`.factory/claims.json\`. | 5 | Pass |
| Each product claim names its exact test command and clean sandbox. | 10 | Pass |
| After deployment, \`npm run test:live\` checks billing, response policy, route metadata, the 404 page, and deployed asset identity. | 16 | Pass; \`live-deployment\` |
| Optional one-time purchase | 3 | Pass |
| Saving, restoring, exports, print tools, and safety information need no license. | 11 | Pass; \`free-core\` |
| Pay $12 USD once to add a printed cover note. | 10 | Pass; \`paid-unlock\` |
| Sociobot and Dodo are the merchant of record. | 8 | Pass; \`billing-policy\` |
| License restoration sends only the entered token to Sociobot. | 9 | Pass; \`license-data-boundary\` |
| Paste the same token on another device to restore the cover-note feature. | 11 | Pass; \`license-restore\` |
| Your health notes do not move with the token. | 9 | Pass; \`license-restore\` |
| Privacy and terms / License / MIT. / See LICENSE. | 3 / 1 / 1 / 2 | Pass |
| Read the privacy page for local storage and license checks. | 9 | Pass |
| Read the terms for safety and purchase terms. | 8 | Pass |

## Demo and sandbox

The one-click landing action opens \`/?demo=1\`. At 390 × 844, the latest realistic sample note begins at 496 px and its content ends at 612 px, within the first viewport. The screen has the persistent **Demo — sample data, nothing is saved** banner, **Reset demo**, and **Start my private timeline**.

The sample contains five specific dated notes. Removing a demo note, resetting, and exiting after first saving a real note preserved **REAL REVIEW NOTE** in the real timeline, removed the banner, and returned to \`/log\`. The exercised live flow made requests only to \`https://care-visit-brief.sociobot.in\`. The declared \`demo:entries\` and \`real:entries\` isolation is additionally covered by the passing \`demo-isolation\` test. No sandbox finding was found.

## Claims audit

A new temporary clone of this checkout ran \`npm ci\`, then every exact command from \`.factory/claims.json\` separately with one worker. All 19 commands passed. The full suite then reported **40 passed, 1 skipped**; the skipped test is the intentional deployment-only test when \`LIVE_CLAIM\` is not set.

| Passing exact tagged commands |
|---|
| \`csv-export\`, \`offline-reload\`, \`device-only\`, \`encrypted-backup\`, \`print-brief\`, \`json-backup\`, \`demo-first-screen\`, \`daily-note-fields\`, \`blank-days\`, \`safety-boundary\` |
| \`free-core\`, \`demo-isolation\`, \`paid-unlock\`, \`license-data-boundary\`, \`license-restore\`, \`billing-policy\`, \`build-output\`, \`deployment-config\` |
| \`live-deployment\` passed with \`LIVE_CLAIM=1\` and reported “Live release checks passed for https://care-visit-brief.sociobot.in”. |

The observed live copy maps to a registered claim wherever it makes a reliance-bearing promise. No unlisted claim finding was found.

## Structure, accessibility, links, and identity

- \`/\`, \`/log\`, \`/?demo=1\`, \`/demo\`, \`/privacy\`, and \`/terms\` return 200. \`/missing-page\` returns a designed 404. Visible internal links, assets, robots, sitemap, manifest, favicon, and Apple icon returned successfully. The checkout link returned an HTTPS 303 to Dodo.
- Every audited route has one \`<h1>\`, one \`<main>\`, \`lang="en"\`, a title, description, canonical, OG title, header, footer, skip link, and legal links. Titles follow the required product/route pattern. The unknown route's console reports the expected failed 404 navigation response, not an application exception.
- Independent Axe WCAG 2 A/AA scans at 390 px found no violations on \`/\`, \`/log\`, \`/?demo=1\`, \`/demo\`, \`/privacy\`, \`/terms\`, or \`/missing-page\`. Normal routes produced no console errors.
- Route change correctly focuses the destination heading. F-2-1 is the sole route-history failure because it does not restore scroll position.
- The warm-paper, ruled-note, ink/oxide visual system and original notebook still life match \`.factory/design.md\` and are distinct from a generic SaaS template. Asset provenance is documented there.

## Earlier-history verification

I read \`review-1.md\`, \`polish-1.md\`, and the prior handoff, then checked each review-1 finding against current live behaviour and source. All F-1 findings are fixed; none is reopened under its earlier id.

| Earlier finding | Current verification |
|---|---|
| F-1-1, F-1-4 | Sample preview is in the initial mobile viewport; \`demo-first-screen\` passes. |
| F-1-2 | \`print-brief\` renders the sample as one A4 page and rejects overflowing ranges. |
| F-1-3 | Recorded fixture asserts USD 12, 1,200 minor units, and one-time billing. |
| F-1-5 through F-1-17 | The named field, blank-day, print, safety, free-core, demo, encryption, license, billing, build, deployment, and live claims all exist and their exact tests passed. |
| F-1-18 | Live route-specific canonical, OG, Twitter, title, and description metadata is present. |
| F-1-19 | Live 404 has the common shell, legal links, favicon, description, canonical, and social metadata. |
| F-1-20 through F-1-25 | Paid copy names a cover note; product terms are consistent; vague/jargon and long copy are absent; actions name their outcomes. |

The earlier handoff also claimed that Back restored the landing scroll position. That was not one of the F-1 ids, but it is contradicted by the live retest and source, and is recorded as new F-2-1.

## Missed leverage

No missed feature finding. The brief implies local capture, privacy, a missed-day-safe timeline, export/backup, and a one-page printed brief; all are present. An AI feature would not improve this deterministic, offline, sensitive health-note job without adding a disclosure path, so none is expected here.

## What would make this perfect

Implement and test scroll-state restoration for in-app Back and Forward. Then repeat the cold first read, complete claim matrix, demo-isolation check, metadata/link crawl, and mobile keyboard test. A PASS requires that retest to leave no findings at all.

