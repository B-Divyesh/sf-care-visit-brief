# Adversarial first-read review 1 — Care Visit Brief

**Verdict: FAIL**

**Live site:** https://care-visit-brief.sociobot.in

**Reviewed:** 2026-08-28

**Candidate:** `61060740242176ac2d1e960f01e918b6caffb71e`

The first screen explains the basic job, audience, and first action. The review
still fails because the demo does not show sample output on its first screen,
the shipped sample brief prints as two pages despite the one-page product
contract, and the claim contract leaves material statements untested. There
are also route metadata, 404-shell, terminology, and README copy findings.

## Findings

### Blocking

#### F-1-1 — The demo's first screen does not show the sample being used

- **Quote/location:** Landing action: “Try it with sample data” and “See a
  finished visit history right away.” On live `/demo` at 390 × 844, the first
  sample card starts about **1,882 px** below the viewport. At 1440 × 900 it
  starts about **1,647 px** below the viewport.
- **Why this fails:** The post-click first screen contains the demo banner,
  heading, and a blank input form. A first-time visitor must scroll through the
  complete form before seeing any realistic output. The promised finished
  history is not visible “right away,” and the required demo shape says the
  first screen must already look like the product in use.
- **Concrete fix:** Put a compact sample chronology or finished one-page brief
  directly below the demo heading, above the input form. Keep an obvious “Add
  another note” action nearby. Add a 390 px test that asserts at least one
  realistic sample entry or the finished brief intersects the initial
  viewport.

#### F-1-2 — The sample “one-page visit brief” prints as two pages

- **Quote/location:** `.factory/brief.json`: “a printable one-page visit
  brief.” Live button: “Open printable brief.”
- **Why this fails:** Printing the five shipped demo entries to A4 with
  Chromium produced a **two-page PDF**. The sample is the smallest supported
  proof path; if it cannot fit, the core handoff promised by the researched
  opportunity is not delivered end to end. The current claim test only checks
  that a popup contains chronology text.
- **Concrete fix:** Design a genuinely one-page print layout with a compact
  date-range summary and condensed chronology. Set print page size/margins,
  handle overflow explicitly, and tell the user when the selected range will
  exceed one page. Extend the print claim test to render the shipped sample to
  PDF and assert one page.

#### F-1-3 — The `$12 one-time` quantitative claim is not tested by its claim command

- **Quote/location:** `.factory/claims.json` `paid-unlock`: “$12 one-time
  unlock includes a personal cover note for printed briefs.”
- **Why this fails:** `npm test -- --grep @claim:paid-unlock` passes, but the
  tagged test never asserts `$12`, currency, or one-time purchase status. It
  only mocks a valid license and checks the cover note. The separate live
  script checks a USD 12 catalog value, but it is not the listed claim test and
  still does not prove the one-time purchase term. A quantitative claim must
  assert its number in its own sandbox test.
- **Concrete fix:** Make the tagged claim test assert the displayed price,
  currency, checkout product metadata, and one-time billing model using a
  recorded fixture. Keep live catalog verification as a separate deployment
  check.

### Major

#### F-1-4 — Unlisted claim: the demo shows a finished history immediately

- **Quote/location:** Landing: “See a finished visit history right away.”
- **Why this fails:** No `.factory/claims.json` entry covers this observable
  demo outcome, and the live result contradicts it at both tested widths.
- **Concrete fix:** Fix F-1-1, then add a `demo-first-screen` claim whose 390 px
  test checks the banner, realistic sample content, and its initial-viewport
  position.

#### F-1-5 — Unlisted claim: the core log captures the stated fields

- **Quote/location:** README: “It records a severity mark, optional tags, and
  a short note, then makes a printable visit brief.”
- **Why this fails:** `print-brief` covers the output, but no claim entry tests
  saving and reloading the promised severity, tags, and note together.
- **Concrete fix:** Add a `daily-note-fields` claim and a demo test that saves
  all three field types, reloads, and checks the resulting timeline and print
  output.

#### F-1-6 — Unlisted claim: blank days are preserved without warnings

- **Quote/location:** Landing: “No missed-day warning.” “Blank days stay
  honestly blank.” The populated landing state also says “Days without a note
  stay blank.”
- **Why this fails:** A visitor may rely on this missed-day-safe behavior, but
  no claim entry or tagged test covers it.
- **Concrete fix:** Add a `blank-days` claim that crosses multiple dates in the
  demo and confirms the app neither creates entries nor displays a missed-day
  warning.

#### F-1-7 — Unlisted claim: print uses only saved notes in the selected range

- **Quote/location:** Landing brief tools: “The print view uses only the notes
  you saved.”
- **Why this fails:** `print-brief` checks that sample notes appear, but does
  not prove that unsaved form text and out-of-range notes are excluded.
- **Concrete fix:** Expand the claim text and tagged test to add unsaved text
  plus an out-of-range entry, then assert neither appears in the print view.

#### F-1-8 — Unlisted claim: the tool does not diagnose, interpret, recommend, or contact

- **Quote/location:** Landing: “This log does not diagnose symptoms or
  recommend treatment.” and “It does not diagnose a condition, interpret
  symptoms, or contact your clinician.” README repeats the diagnosis and
  treatment statement; Terms says it is not “medical advice, diagnosis, or
  emergency care.”
- **Why this fails:** These are safety boundaries a visitor can rely on. The
  `device-only` network test only partially addresses clinician contact and
  does not list this broader safety claim.
- **Concrete fix:** Add one explicit safety-boundary claim with all locations.
  Test the complete demo flow for no generated interpretations,
  recommendations, or clinician-bound requests, and retain the visible
  disclaimer.

#### F-1-9 — Unlisted claim: the core log, exports, and safety information are free

- **Quote/location:** Landing: “$12 one-time unlock; the core log stays free”
  and “Your log, exports, and safety information remain free.” README: “The
  core log and all exports are free.”
- **Why this fails:** `paid-unlock` does not list or assert the free boundary.
  This is a purchase claim, not incidental copy.
- **Concrete fix:** Add a `free-core` claim and verify from clean `/log` that
  saving, restoring, CSV/JSON/encrypted export, print, and safety copy require
  no license.

#### F-1-10 — Unlisted claim: demo activity cannot reach the real log

- **Quote/location:** README: “Nothing in demo mode reaches the real log.”
- **Why this fails:** Namespace isolation is central to the demo contract but
  has no dedicated claim entry. The current paid test checks part of this as a
  side effect, not the general statement.
- **Concrete fix:** Add a `demo-isolation` claim. Seed a real note, mutate,
  reset, reload, and leave demo mode, then assert the real note is unchanged
  and demo keys are cleared or empty.

#### F-1-11 — Unlisted claim: legacy encrypted backups restore with stronger new protection

- **Quote/location:** README: “Encrypted backups made by the earlier release
  also restore; download a fresh one afterward for stronger password
  protection.”
- **Why this fails:** The encrypted-backup test happens to exercise a legacy
  fixture, but this compatibility and comparative-strength statement is absent
  from the registered claim. “Stronger” also needs a concrete comparison.
- **Concrete fix:** Expand the claim to state the measurable PBKDF2 iteration
  change (10,000 legacy; 600,000 new), list the README location, and retain the
  existing legacy restore assertion.

#### F-1-12 — Unlisted claim: billing sends only a license token

- **Quote/location:** README: “Sociobot and Dodo handle checkout and license
  verification; the app sends only the license token to verify it.” Privacy:
  “Sociobot receives only the license token needed to check it.”
- **Why this fails:** This is a privacy claim. The paid test routes the expected
  URL but does not assert that no other request data or user health data is
  transmitted during purchase restoration.
- **Concrete fix:** Add a `license-data-boundary` claim and intercept the full
  request, asserting origin, method, query/body fields, and absence of entries,
  notes, tags, and device identifiers.

#### F-1-13 — Unlisted claim: a license restores the unlock on another device

- **Quote/location:** README: “You can paste a license token on the product
  page to restore it on another device.”
- **Why this fails:** The paid test uses one browser context and does not prove
  a clean second-device context can restore the purchase.
- **Concrete fix:** Add a `license-restore` claim with two clean contexts: buy
  or fixture-issue in the first, paste in the second, then assert the cover
  note feature unlocks without copying health data.

#### F-1-14 — Unlisted claim: merchant and refund behavior

- **Quote/location:** Terms: “Sociobot and Dodo are the merchant of record.
  Refunds revoke the related license.”
- **Why this fails:** Neither statement appears in the claim registry, and the
  paid test does not exercise refund revocation.
- **Concrete fix:** Add a billing-policy claim backed by recorded active and
  refunded license fixtures, and verify the merchant wording against the
  product catalog contract.

#### F-1-15 — Unlisted README claim: build output location

- **Quote/location:** README: “The deploy output is `dist/`, with `index.html`
  at its root.”
- **Why this fails:** This is a documented outcome a deployer relies on, but it
  is outside the claim registry.
- **Concrete fix:** Add a build-output claim using `npm run build` and assert
  both paths exist, or move developer-only verification contracts to a clearly
  named, equally enforced engineering-claims file.

#### F-1-16 — Unlisted README claim: deployment config behavior

- **Quote/location:** README: “Deploy `dist/` as a static site with the included
  `staticwebapp.config.json`; it supplies the SPA fallback, immutable
  hashed-asset caching, security headers, and the real 404 response.”
- **Why this fails:** This 25-word sentence makes four deployment claims. Some
  are checked elsewhere, but none is registered as the claim contract users
  were instructed to audit.
- **Concrete fix:** Split it into plain sentences and add tagged assertions for
  route rewrites, immutable asset headers, security headers, and a true 404.

#### F-1-17 — Unlisted README claim: `test:live` verifies deployed identity and policy

- **Quote/location:** README: “Run `test:live` after deployment; it verifies the
  production billing route, response policy, and deployed asset identity
  against the local `dist/` build.”
- **Why this fails:** The script passed in this review, but the documented claim
  has no claims entry and therefore is not included when a verifier runs every
  registered claim.
- **Concrete fix:** Register a deployment-only claim with `npm run test:live`,
  or distinguish product claims from mandatory deployment checks in the
  contract and make both machine-enforced.

#### F-1-18 — Route canonical and social metadata stay stuck on the home page

- **Quote/location:** Live `/log`, `/demo`, `/privacy`, and `/terms` all expose
  canonical `https://care-visit-brief.sociobot.in/` and OG title “Care Visit
  Brief — Make an accurate visit history.”
- **Why this fails:** Deep routes identify themselves with distinct document
  titles but tell crawlers and link previews that they are the home page. The
  metadata does not describe the current route.
- **Concrete fix:** On every route change update canonical URL, OG/Twitter
  title, and description alongside `document.title`. Add deep-link and
  back/forward metadata assertions.

#### F-1-19 — The real 404 omits the standard site shell and metadata

- **Quote/location:** Live `/missing-page` returns the designed notebook 404,
  but has **0 headers**, **0 footers**, no meta description, no canonical, no OG
  metadata, and no linked favicon.
- **Why this fails:** The site-structure contract requires the consistent
  wordmark/navigation and footer on every route. A lost visitor gets only
  “Return home,” and the route loses the product's normal identity metadata.
- **Concrete fix:** Build the static 404 with the same header/footer, Privacy
  and Terms links, favicon, description, canonical, and social metadata while
  preserving HTTP 404.

### Minor

#### F-1-20 — The paid heading is contextless and implies the free log is withheld

- **Quote/location:** Landing heading: “Keep the whole notebook.”
- **Why this fails:** Heard in a heading list, it does not name the paid result.
  Beside claims that the core log is free, “whole notebook” can imply that part
  of the notebook is otherwise withheld.
- **Concrete fix:** Rewrite it as “Add a cover note to printed briefs.”

#### F-1-21 — The same concepts use inconsistent terms

- **Quote/location:** The daily item is “note” almost everywhere but “entry” in
  “Remove entry” and “Entries stay in the browser.” The medicine field is
  “Medicine changes,” entry cards say “Medicines,” and the brief calls it
  “Medicine changes.” The collection is alternately “log,” “record,”
  “timeline,” “visit history,” and “notebook” without definitions.
- **Why this fails:** A hurried user cannot be sure whether these are distinct
  objects or synonyms, especially when restoring or deleting health data.
- **Concrete fix:** Use **note** for one saved day, **timeline** for the
  collection, **visit brief** for the print output, and **medicine changes** for
  the field everywhere. Rewrite “Remove entry” to “Remove note” and explain
  “log” only if it remains a navigation label.

#### F-1-22 — Several phrases are jargon or vague outside their layout

- **Quote/location:** “Private field notes for appointments,” “Appointment
  handoff,” README “isolated sample,” “SPA fallback,” “immutable hashed-asset
  caching,” “production billing route,” and “deployed asset identity.”
- **Why this fails:** “Field notes” and “handoff” are not the words most people
  use for symptom notes and a clinician printout. The README deployment terms
  compress several ideas instead of explaining the result.
- **Concrete fix:** Use “Private symptom notes for appointments,” “Printable
  visit brief,” and “sample that cannot change your real notes.” In the
  developer section, split each deployment behavior into one direct sentence
  and define only the necessary technical term.

#### F-1-23 — One README sentence exceeds the 22-word hard cap

- **Quote/location:** README deployment sentence beginning “Deploy `dist/` as
  a static site…” — **25 words**.
- **Why this fails:** It combines deployment action, routing, caching, headers,
  and 404 behavior in one sentence.
- **Concrete fix:** “Deploy the `dist/` folder as a static site. The included
  config serves app routes, caches versioned assets, adds security headers, and
  returns the custom 404 page.”

#### F-1-24 — Subjective copy makes untestable usefulness claims

- **Quote/location:** “A few marks are enough.” “That is useful context too.”
  “Care Visit Brief turns small notes into a useful visit history.” “support
  ongoing maintenance.”
- **Why this fails:** “Enough,” “useful,” and the destination of purchase funds
  are not established by a claim test. They add confidence without measurable
  evidence.
- **Concrete fix:** Use observable wording: “Save a severity number, optional
  tags, and a short note.” “Blank days remain blank.” “Care Visit Brief turns
  daily notes into a printable chronology.” Remove the maintenance statement
  unless its use is documented and verifiable.

#### F-1-25 — Two actions do not name the result

- **Quote/location:** Demo button “Start for real”; purchase button “Verify
  license.”
- **Why this fails:** “For real” is vague, and “verify” names an internal
  process rather than what the person receives.
- **Concrete fix:** Use “Start my private log” and “Restore my unlock.”

## Cold first read, before scrolling

Fresh browser contexts had no stored data and service workers were blocked for
the first-read capture.

| View | What it does, in reviewer's words | For whom | First click | Result |
|---|---|---|---|---|
| 390 × 844 | Keeps short symptom notes and turns them into a clinician visit history. | People whose symptoms change between appointments. | “Try it with sample data.” | PASS |
| 1440 × 900 | Keeps short symptom notes and turns them into a clinician visit history. | People whose symptoms change between appointments. | “Try it with sample data.” | PASS |

The exact text that made all three answers possible was “Make your visit
history clear,” “For people whose symptoms change between appointments, keep a
short record you can hand to a clinician,” and “Try it with sample data.” The
landing first screen itself is not a blocking finding.

## Copy audit

Word counts treat a whitespace-separated hyphenated term or number as one
word. The landing audit used a fresh empty real-log state. Repeated interface
fragments are shown once with their repetition count. Code commands in README
are commands rather than sentences and are not assigned prose word counts.

### Live landing page

| Exact copy | Words | Flag |
|---|---:|---|
| Skip to content | 3 | — |
| Care Visit Brief | 3 | — |
| Log | 1 | F-1-21 |
| Demo | 1 | — |
| Privacy | 1 | — |
| Private field notes for appointments | 5 | F-1-22 |
| Make your visit history clear | 5 | — |
| For people whose symptoms change between appointments, keep a short record you can hand to a clinician. | 17 | — |
| Try it with sample data | 5 | — |
| See a finished visit history right away. | 7 | F-1-1, F-1-4 |
| Stays on this device | 4 | covered: `device-only` |
| Works after the first visit offline | 6 | covered: `offline-reload` |
| $12 one-time unlock; the core log stays free | 8 | F-1-3, F-1-9 |
| Keep only the details you may need later. | 8 | — |
| Daily note | 2 | — |
| Record what changed | 3 | — |
| A few marks are enough. | 5 | F-1-24 |
| You can add more only when it helps. | 8 | F-1-24 |
| Date | 1 | — |
| How hard was it today? | 5 | — |
| 0 None / 1 Mild / 2 Noticeable / 3 Hard / 4 Severe | 2 each | — |
| Symptoms · optional | 2 | — |
| Headache / Fatigue / Nausea / Pain | 1 each | — |
| Add your own (three fields) | 3 | — |
| Add a symptoms tag | 4 | — |
| Possible triggers · optional | 3 | — |
| Poor sleep | 2 | — |
| Stress / Food / Activity | 1 each | — |
| Add a possible triggers tag | 5 | — |
| Medicine changes · optional | 3 | F-1-21 |
| New dose / As needed / Missed dose | 2 each | — |
| Add a medicine changes tag | 5 | F-1-21 |
| What changed? · optional | 3 | — |
| A short note in your own words | 7 | — |
| Save today’s note | 3 | — |
| This log does not diagnose symptoms or recommend treatment. | 9 | F-1-8 |
| Your record | 2 | F-1-21 |
| Timeline | 1 | — |
| Your notes will appear here. | 5 | — |
| Start with a severity mark. | 5 | — |
| You do not need to fill every field. | 8 | — |
| Appointment handoff | 2 | F-1-22 |
| Make a visit brief | 4 | — |
| Choose a date range. | 4 | — |
| The print view uses only the notes you saved. | 9 | F-1-7 |
| From / To | 1 each | — |
| Open printable brief | 3 | covered: `print-brief` |
| Export CSV | 2 | covered: `csv-export` |
| Export backup | 2 | covered: `json-backup` |
| Make an encrypted backup | 4 | covered: `encrypted-backup` |
| Choose a password. | 3 | — |
| You need it to restore this backup later. | 8 | covered: `encrypted-backup` |
| Backup password | 2 | — |
| Download encrypted backup | 3 | covered: `encrypted-backup` |
| Restore from a backup | 4 | covered: `encrypted-backup` |
| Password for an encrypted backup | 5 | — |
| Mark the day | 3 | — |
| Choose a severity number. | 4 | F-1-5 |
| Add only tags that matter. | 5 | F-1-5 |
| Leave gaps alone | 3 | — |
| No missed-day warning. | 3 | F-1-6 |
| Blank days stay honestly blank. | 5 | F-1-6 |
| Bring the record | 3 | F-1-21 |
| Print a short chronology before your next visit. | 8 | covered: `print-brief` |
| Notes, not medical advice | 4 | F-1-8 |
| Care Visit Brief stores entries in this browser. | 8 | F-1-21; covered: `device-only` |
| It does not diagnose a condition, interpret symptoms, or contact your clinician. | 12 | F-1-8 |
| For urgent symptoms or immediate danger, contact local emergency services. | 10 | — |
| One-time unlock | 2 | F-1-3 |
| Keep the whole notebook | 4 | F-1-20 |
| For $12, add a personal cover note to printed briefs and support ongoing maintenance. | 14 | F-1-3, F-1-24 |
| Your log, exports, and safety information remain free. | 8 | F-1-9 |
| Buy the $12 unlock | 4 | F-1-3 |
| Have a license? | 3 | — |
| Paste license token | 3 | — |
| Verify license | 2 | F-1-25 |
| Care Visit Brief turns small notes into a useful visit history. | 11 | F-1-21, F-1-24 |
| Privacy · Terms · Built by Param Factory · v1.0.0 | 7 | — |
| Illustration generated for this product. | 5 | provenance confirmed in `.factory/design.md` |

State-dependent landing copy also includes “Days without a note stay blank.”
(6, F-1-6), “That is useful context too.” (5, F-1-24), “Symptoms,” “Triggers,”
“Medicines” (1 each, F-1-21 for Medicines), and “Remove entry” (2, F-1-21).

No landing sentence exceeds 22 words. No banned marketing word from the
plain-words list appears.

### README

| Exact copy | Words | Flag |
|---|---:|---|
| Care Visit Brief | 3 | — |
| Care Visit Brief is a private daily symptom log for people who need a short, accurate history at a clinical appointment. | 21 | — |
| It records a severity mark, optional tags, and a short note, then makes a printable visit brief. | 17 | F-1-5 |
| Entries stay in the browser on the device. | 8 | F-1-21; covered: `device-only` |
| The app works offline after the first visit. | 8 | covered: `offline-reload` |
| CSV and JSON exports keep the record portable. | 8 | covered: `csv-export`, `json-backup` |
| This tool does not diagnose symptoms or recommend treatment. | 9 | F-1-8 |
| Use it | 2 | — |
| Open `/log` to start a real private log. | 8 | F-1-21 |
| Open `/demo` to try the isolated sample. | 7 | F-1-22 |
| Nothing in demo mode reaches the real log. | 8 | F-1-10 |
| Use **Open printable brief** before an appointment. | 7 | covered: `print-brief` |
| Use **Export backup** or **Download encrypted backup** to keep a copy. | 11 | covered: `json-backup`, `encrypted-backup` |
| Use **Restore from a backup** and the same password to restore an encrypted copy. | 14 | covered: `encrypted-backup` |
| Encrypted backups made by the earlier release also restore; download a fresh one afterward for stronger password protection. | 18 | F-1-11 |
| Develop and verify | 3 | — |
| The deploy output is `dist/`, with `index.html` at its root. | 10 | F-1-15 |
| Deploy `dist/` as a static site with the included `staticwebapp.config.json`; it supplies the SPA fallback, immutable hashed-asset caching, security headers, and the real 404 response. | 25 | F-1-16, F-1-22, F-1-23 |
| The claim tests and their demo instructions are in `.factory/claims.json` and `.factory/demo.md`. | 12 | verified pointer |
| Run `test:live` after deployment; it verifies the production billing route, response policy, and deployed asset identity against the local `dist/` build. | 21 | F-1-17, F-1-22 |
| Optional one-time unlock | 3 | — |
| The core log and all exports are free. | 8 | F-1-9 |
| A $12 one-time unlock adds a personal cover note to printed briefs and supports maintenance. | 15 | F-1-3, F-1-24 |
| Sociobot and Dodo handle checkout and license verification; the app sends only the license token to verify it. | 18 | F-1-12 |
| You can paste a license token on the product page to restore it on another device. | 16 | F-1-13 |
| Privacy and terms | 3 | — |
| Read `/privacy` for local storage and optional license verification. | 9 | — |
| Read `/terms` for the medical disclaimer and purchase terms. | 9 | — |

README commands audited separately: `npm ci` (2 words), `npm run dev` (3),
`npm test` (2), `npm run build` (3), and `npm run test:live` (3).

## Demo and sandbox evidence

- One click from `/` opens `/demo` and displays the persistent banner “Demo —
  sample data, nothing is saved,” plus **Reset demo** and **Start for real**.
- Five realistic notes are seeded under IndexedDB key `demo:entries`.
- Removing one sample reduced the count to four; Reset restored all five.
- A real note was created first, then demo data was removed/reset. **Start for
  real** returned to `/log` with the real note unchanged and no demo banner.
- The exercised live flow made 15 same-origin requests and zero cross-origin
  requests.
- After a first live visit, clearing HTTP cache, going offline, and reopening
  `/demo`, the banner and all five sample entries loaded.
- Sandbox separation and offline behavior pass. Immediate sample visibility
  fails as F-1-1.

## Claims audit

Every command in `.factory/claims.json` was run individually after `npm ci`.

| Claim ID | Listed command result | What the test demonstrated |
|---|---|---|
| `csv-export` | PASS, 1 test | Six CSV lines, headers, and a sample date |
| `offline-reload` | PASS, 1 test | Fresh-profile service-worker reload of `/demo` offline |
| `device-only` | PASS, 1 test | Demo load and JSON export made same-origin requests only |
| `encrypted-backup` | PASS, 1 test | AES-GCM/PBKDF2 metadata, hidden plaintext, restore, legacy restore |
| `print-brief` | PASS, 1 test | Popup includes sample chronology and a print button; it does **not** test page count |
| `json-backup` | PASS, 1 test | Version 1 JSON with all five samples |
| `paid-unlock` | Command passes; claim incomplete | Cover-note unlock and demo namespace; price/one-time terms unasserted (F-1-3) |

The claim commands have no execution failures, but F-1-3 is an untested part
of a listed claim and F-1-4 through F-1-17 identify claim-like statements that
are absent from the registry. Therefore the review cannot report “no untested
claim.”

## Structure, links, accessibility, and identity

- `/`, `/log`, `/demo`, `/privacy`, and `/terms` return 200. The checkout link
  returns an HTTPS 303. Favicon, apple-touch icon, social image, manifest,
  offline page, robots, and sitemap return 200. No dead link was found.
- Each app route has one `h1`, one `main`, `lang="en"`, the expected route
  title, a skip link, header, and footer. Home title is 49 characters. The 404
  returns HTTP 404 and has one `h1`/`main`, but fails the common shell and
  metadata checks in F-1-19.
- SPA navigation focuses and announces the destination heading. Browser Back
  restored the landing scroll position (1,200 px) and focused/announced its
  `h1`.
- Live Axe WCAG 2 A/AA checks found zero violations on `/`, `/log`, `/demo`,
  `/privacy`, `/terms`, and `/missing-page`. The factory URL verifier found no
  console errors, one `h1`, `lang=en`, one main landmark, complete image alt,
  and labeled buttons.
- `npm test` passed **27/27**. `npm run build` produced `dist/`; first-load JS
  is 27.92 KB raw / 10.18 KB gzip. `npm run test:live` passed deployed asset,
  header, service-worker, catalog, checkout, and invalid-license checks.
- The warm-paper notebook image, ink/oxide palette, clipped-paper components,
  serif display face, and notebook-specific 404 are recognizably distinct from
  a generic SaaS template. Asset provenance is recorded in
  `.factory/design.md`.

## Earlier history verification

No earlier `.factory/review-*.md` or `.factory/polish-*.md` exists. The prior
handoff and verification documents named several previously repaired areas;
they were checked rather than accepted by status label.

| Earlier area | Fresh evidence | Result |
|---|---|---|
| Malformed import safety | Full suite test saved a real note, rejected malformed JSON, reloaded, and retained it | Fixed |
| Demo-state isolation | Live real-note/demo/reset/start-real exercise; paid claim namespace test | Fixed, except claim registration F-1-10 |
| Waiting service-worker update | Full suite retains the update prompt across SPA navigation; update code persists `updateReady` | Fixed |
| Mobile touch targets/overflow | Full 390 px suite check passed 44 px targets and no horizontal overflow | Fixed |
| Deletion recovery | Full suite passed single and repeated Undo; corrupt record recovery/export/restore passed | Fixed |
| Asset cache/versioning | Full suite and `test:live` passed generated worker precache and deployed hash identity | Fixed |

The prior handoff also said the demo “immediately presents five realistic
sample entries.” Fresh viewport-position evidence contradicts that statement;
F-1-1 reopens it as blocking.

## Missed leverage

F-1-2 is also the missed-leverage finding. A normal person bringing this to a
clinician would expect a one-page scan summary, not only a multi-page sequence
of cards. The concrete addition should be local and deterministic: date range,
number of noted days, count of severe days, most frequent symptom/trigger tags,
and a condensed chronology. An AI feature is not required for those facts and
would add unnecessary health-data disclosure; if optional drafting is added
later, it must use an explicit Sociobot-key action, show exactly what is sent,
and preserve the non-AI brief.

## What would make this perfect

There is not “nothing left to do.” A perfect next candidate must close every
finding above: show the finished sample in the first demo viewport, guarantee
the shipped sample brief is one printed page, make every public claim
registered and fully asserted, correct route/404 metadata and shell, and
remove the copy/terminology flags. Then rerun the entire cold-read, copy,
sandbox, claim, history, routing, link, accessibility, build, and live checklist
from a fresh context.
