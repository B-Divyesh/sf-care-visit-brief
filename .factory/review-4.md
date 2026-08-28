# Adversarial first-read review 4 — Care Visit Brief

**Verdict: PASS**

**Reviewed:** 2026-08-28  
**Live site:** https://care-visit-brief.sociobot.in  
**Candidate:** 3f6a7425ed3441898fdcd75ec168f36470d1c191

No blocking, major, minor, or untested-claim finding remained after this
from-scratch review.

## Cold first read

Fresh Chromium contexts had no storage and service workers were blocked.

| View | What it does | For whom | First click | Result |
| --- | --- | --- | --- | --- |
| 390 × 844 | Saves symptom notes and makes a visit brief to print. | People whose symptoms change between appointments. | Try it with sample data | Pass |
| 1440 × 900 | Saves symptom notes and makes a visit brief to print. | People whose symptoms change between appointments. | Try it with sample data | Pass |

The exact first-screen text is “Turn symptom notes into a visit brief,” “For
people with changing symptoms, build a short timeline to print for a
clinician,” and “Try it with sample data.” “Open a filled sample timeline.
Your notes stay untouched.” makes the immediate result clear. No first-read
blocking finding was reproduced.

## Copy audit

Counts treat a hyphenated term, number, path, or button label as one word.
Every sentence, heading, action, and accessible image sentence is listed.
Form labels and tag names are concrete noun labels, not sentences. No copy
exceeds 22 words; no jargon, marketing adjective, inconsistent core term,
metaphor heading, slogan, or non-result-naming button was found.

### Landing page

| Copy | Words | Check |
| --- | ---: | --- |
| Care Visit Brief | 3 | Wordmark; pass |
| My timeline | 2 | Navigation; pass |
| Demo | 1 | Navigation; pass |
| Privacy | 1 | Navigation; pass |
| Private symptom notes for appointments | 5 | Context label; pass |
| Turn symptom notes into a visit brief | 7 | Plain job headline; pass |
| For people with changing symptoms, build a short timeline to print for a clinician. | 14 | Audience/outcome; pass |
| Try it with sample data | 5 | Primary result action; pass |
| Open a filled sample timeline. | 5 | Action result; pass |
| Your notes stay untouched. | 4 | Demo boundary; claim-backed |
| Notes stay on this device | 5 | Privacy fact; claim-backed |
| Works offline after your first visit | 6 | Offline fact; claim-backed |
| $12 USD once; the timeline stays free | 7 | Price/free fact; claim-backed |
| An open ruled notebook, pencil, and blank note paper on a desk. | 12 | Image alt; pass |
| Record only details you may want to discuss with a clinician. | 11 | Caption; pass |
| Daily note | 2 | Section label; pass |
| Record what changed | 3 | Form heading; pass |
| Save a severity number, optional tags, and a short note. | 10 | Form purpose; claim-backed |
| How hard was it today? | 5 | Severity prompt; pass |
| Save today’s note | 3 | Result action; pass |
| This timeline does not diagnose, interpret symptoms, recommend treatment, or contact a clinician. | 13 | Safety boundary; claim-backed |
| Your timeline | 2 | Section label; pass |
| Saved notes | 2 | Section heading; pass |
| Your notes will appear here. | 5 | Empty state; pass |
| Start with a severity number. | 5 | Empty-state next step; pass |
| You do not need to fill every field. | 8 | Optional-field explanation; pass |
| Printable visit brief | 3 | Section label; pass |
| Make a visit brief | 4 | Section heading; pass |
| Choose a date range. | 4 | Next step; pass |
| The print view uses only your saved notes. | 8 | Print boundary; claim-backed |
| If the notes need more than one page, choose a shorter range. | 12 | Print recovery; claim-backed |
| Open one-page visit brief | 4 | Result action; claim-backed |
| Export CSV | 2 | Result action; claim-backed |
| Export backup | 2 | Result action; claim-backed |
| Make an encrypted backup | 4 | Tool heading; pass |
| Choose a password. | 3 | Next step; pass |
| You need it to restore this backup later. | 8 | Consequence; pass |
| Download encrypted backup | 3 | Result action; claim-backed |
| Restore from a backup | 4 | Input label; pass |
| Password for an encrypted backup | 5 | Input label; pass |
| Choose the day’s severity | 4 | Step heading; pass |
| Choose a severity number. | 4 | Step instruction; pass |
| Add only tags that matter. | 5 | Optionality instruction; pass |
| Leave days without notes blank | 5 | Step heading; pass |
| No missed-day warning appears. | 4 | Gap behavior; claim-backed |
| Blank days remain blank. | 4 | Gap behavior; claim-backed |
| Bring the visit brief | 4 | Step heading; pass |
| Print a short chronology before your next visit. | 8 | Result; claim-backed |
| Notes, not medical advice | 4 | Safety heading; pass |
| Care Visit Brief stores notes in this browser. | 8 | Storage fact; claim-backed |
| It does not diagnose, interpret symptoms, recommend treatment, or contact a clinician. | 12 | Safety boundary; claim-backed |
| For urgent symptoms or immediate danger, contact local emergency services. | 10 | Safety next step; pass |
| One-time unlock | 2 | Paid section label; pass |
| Add a cover note to printed briefs | 7 | Paid result heading; pass |
| Pay $12 USD once to add a personal cover note. | 10 | Price/outcome; claim-backed |
| Your timeline, exports, print tools, and safety information stay free. | 10 | Free boundary; claim-backed |
| Buy the $12 unlock | 4 | Purchase action; claim-backed |
| Restore my unlock | 3 | Result action; claim-backed |
| Care Visit Brief turns daily notes into a printable visit brief. | 11 | Footer one-liner; claim-backed |
| Illustration generated for this product. | 5 | Asset provenance; pass |

The remaining controls — Date, severity names, Symptoms, Possible triggers,
Medicine changes, What changed?, From, and To — are direct labels. Core
terminology is consistent: note, timeline, visit brief, medicine changes,
cover note, and backup.

### README

| Sentence or heading | Words | Check |
| --- | ---: | --- |
| Care Visit Brief | 3 | Heading; pass |
| Care Visit Brief turns daily symptom notes into a printable visit brief. | 12 | Claim-backed |
| It is for people whose symptoms change between appointments. | 9 | Audience; pass |
| A note saves a severity number, symptom tags, possible triggers, medicine changes, and your words. | 15 | Claim-backed |
| Notes stay in this browser. | 6 | Claim-backed |
| The app uses no analytics. | 5 | Claim-backed |
| It works offline after your first visit. | 7 | Claim-backed |
| The app does not diagnose, interpret symptoms, recommend treatment, or contact a clinician. | 13 | Claim-backed |
| Use Care Visit Brief | 3 | Heading; pass |
| Open /?demo=1 to see five sample notes without changing your real timeline. | 11 | Claim-backed |
| Use Reset demo to restore the sample. | 7 | Claim-backed |
| Use Start my private timeline to discard it. | 8 | Claim-backed |
| Open /log to start your private timeline. | 8 | Direct instruction; pass |
| Days without a note stay blank. | 6 | Claim-backed |
| Use Open one-page visit brief before an appointment. | 8 | Claim-backed |
| Shorten the date range if the notes need another page. | 9 | Claim-backed |
| Use Export CSV for a table. | 6 | Claim-backed |
| Use Export backup for a versioned JSON copy. | 8 | Claim-backed |
| Use Download encrypted backup for a password-protected copy. | 7 | Claim-backed |
| Restore it with the same password. | 6 | Claim-backed |
| New encrypted backups use 600,000 PBKDF2 iterations. | 7 | Claim-backed |
| Backups from the earlier 10,000-iteration release also restore. | 7 | Claim-backed |
| Make a new backup afterward. | 5 | Direct instruction; pass |
| Develop and verify | 3 | Heading; pass |
| The production build creates dist/index.html. | 5 | Claim-backed |
| Deploy the dist/ folder as a static site. | 8 | Direct instruction; pass |
| The included config serves app routes and the custom 404 page. | 11 | Claim-backed |
| It also caches versioned assets and adds security headers. | 9 | Claim-backed |
| The claim registry is .factory/claims.json. | 5 | Direct reference; pass |
| Each product claim names its exact test command and clean sandbox. | 10 | Verified registry fact; pass |
| After deployment, npm run test:live checks the price, security headers, page titles and URLs, the 404 page, and built-file hashes. | 20 | Claim-backed |
| Optional one-time purchase | 3 | Heading; pass |
| Saving, restoring, exports, print tools, and safety information need no license. | 10 | Claim-backed |
| Pay $12 USD once to add a printed cover note. | 10 | Claim-backed |
| Sociobot and Dodo are the merchant of record. | 9 | Claim-backed |
| License restoration sends only the entered token to Sociobot. | 9 | Claim-backed |
| Paste the same token on another device to restore the cover-note feature. | 12 | Claim-backed |
| Your health notes do not move with the token. | 9 | Claim-backed |
| Privacy and terms | 3 | Heading; pass |
| Read the privacy page for local storage and license checks. | 10 | Direct link instruction; pass |
| Read the terms for safety and purchase terms. | 9 | Direct link instruction; pass |
| License | 1 | Heading; pass |
| MIT. | 1 | License fact; pass |
| See LICENSE. | 2 | Direct reference; pass |

No proposed rewrite is needed because this audit produced no flags.

## Demo and sandbox

At live /?demo=1, a fresh 390 × 844 context showed the persistent “Demo —
sample data, nothing is saved” banner, Reset demo, Start my private timeline,
and the filled sample. The Aug 23 note ended at 611.8 px in the 844 px
viewport; all five realistic notes were already present.

I saved REVIEW4 REAL NOTE in /log, then saved REVIEW4 DEMO NOTE in demo, reset
demo, and chose Start my private timeline. The real note remained; the demo
note did not appear in real mode. Before exit, IndexedDB held separate
real:entries and demo:entries records. The registered isolation test also
confirms that the demo namespace is removed on exit. The live sample printed
as one A4 PDF page, with no console errors.

## Claims and quality gates

After npm ci (23 packages; 0 reported vulnerabilities), every exact command in
.factory/claims.json was run sequentially from this checkout. All 19 passed,
including LIVE_CLAIM=1 npm test -- --grep @claim:live-deployment. They cover
exports, offline reload, device-only requests, encryption and legacy restore,
print, the demo, safety, pricing/licence boundaries, build output, deployment
config, and live hashes.

npm test passed **42 tests** with **1 expected deployment-only skip**. npm run
build passed and created dist/. Initial JavaScript is 32.58 KB raw / 11.53 KB
gzip; CSS is 11.61 KB raw / 3.38 KB gzip. Landing and README claim-like copy
maps to the registry; no unlisted product claim was found.

The live cold landing/demo request log contained only product-origin requests.
The optional checkout link returned an HTTPS 303. The brief does not imply an
AI function; an AI feature would not add value to this local-first
note-and-print job.

## Structure, routing, accessibility, and history

The home, log, demo, privacy, and terms routes returned 200 with one h1, one
main, route-specific descriptive metadata, canonical URL, Open Graph/Twitter
metadata, and favicon. The designed shared-shell 404 returned HTTP 404 with
legal links and title “Page not found — Care Visit Brief.” All in-app links
returned 200, except the deliberate HTTPS checkout redirect; robots, sitemap,
manifest, offline page, social image, and favicon returned 200.

The test suite's Axe integration found zero serious or critical issues on all
routes. It also covers keyboard save, skip links, 44 px mobile controls, no
390 px overflow, reduced motion, recovery, route-focus announcements, and
Back/Forward scroll restoration. The live page produced no application console
errors. Its warm paper, ink, oxide-red rule, clipped-paper forms, and original
notebook still life visibly match .factory/design.md rather than a generic SaaS
template.

Every earlier review and polish record was read. The following findings were
confirmed fixed in current live behavior and current code/test coverage:

| Earlier finding(s) | Current confirmation |
| --- | --- |
| F-1-1 through F-1-4 | Filled five-note sample is in the first mobile viewport; demo-first-screen passes. |
| F-1-2 | Five-note sample prints on one A4 page; long ranges warn and stop. |
| F-1-3, F-1-9, F-1-12 through F-1-14 | Fixture coverage checks price, free-core, token-only restore, another-device restore, merchant wording, and refunds. |
| F-1-5 through F-1-11 | Registered checks cover fields, gaps, print filtering, safety, demo isolation, and encryption. |
| F-1-15 through F-1-19 | Build, deployment config/live hashes, route metadata, and shared-shell 404 passed. |
| F-1-20 through F-1-25; F-3-1 through F-3-5 | Live copy audit above confirms repaired terms, headings, and actions. |
| F-2-1 | The regression test confirms per-route scroll restoration and focused headings. |

No earlier item is merely marked fixed; each has observable current evidence.

## What would make this perfect

Nothing product-specific is currently missing from the stated job. Preserve
this result by retaining the first-viewport demo and full claim matrix when
changing storage, printing, or billing.

