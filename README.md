# Care Visit Brief

Care Visit Brief turns daily symptom notes into a printable visit brief. It is for people whose symptoms change between appointments.

A note saves a severity number, symptom tags, possible triggers, medicine changes, and your words. Notes stay in this browser. The app uses no analytics. It works offline after your first visit.

The app does not diagnose, interpret symptoms, recommend treatment, or contact a clinician.

## Use it

- Open `/?demo=1` to see five sample notes without changing your real timeline.
- Use **Reset demo** to restore the sample. Use **Start my private timeline** to discard it.
- Open `/log` to start your private timeline. Days without a note stay blank.
- Use **Open one-page visit brief** before an appointment. Shorten the date range if the notes need another page.
- Use **Export CSV** for a table. Use **Export backup** for a versioned JSON copy.
- Use **Download encrypted backup** for a password-protected copy. Restore it with the same password.

New encrypted backups use 600,000 PBKDF2 iterations. Backups from the earlier 10,000-iteration release also restore. Make a new backup afterward.

## Develop and verify

```sh
npm ci
npm run dev
npm test
npm run build
npm run test:live
```

The production build creates `dist/index.html`. Deploy the `dist/` folder as a static site.

The included config serves app routes and the custom 404 page. It also caches versioned assets and adds security headers.

The claim registry is [.factory/claims.json](.factory/claims.json). Each product claim names its exact test command and clean sandbox.

After deployment, `npm run test:live` checks billing, response policy, route metadata, the 404 page, and deployed asset identity.

## Optional one-time purchase

Saving, restoring, exports, print tools, and safety information need no license. Pay $12 USD once to add a printed cover note.

Sociobot and Dodo are the merchant of record. License restoration sends only the entered token to Sociobot.

Paste the same token on another device to restore the cover-note feature. Your health notes do not move with the token.

## Privacy and terms

Read the [privacy page](https://care-visit-brief.sociobot.in/privacy) for local storage and license checks. Read the [terms](https://care-visit-brief.sociobot.in/terms) for safety and purchase terms.

## License

MIT. See [LICENSE](LICENSE).
