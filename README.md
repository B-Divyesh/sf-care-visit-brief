# Care Visit Brief

Care Visit Brief is a private daily symptom log for people who need a short, accurate history at a clinical appointment. It records a severity mark, optional tags, and a short note, then makes a printable visit brief.

Entries stay in the browser on the device. The app works offline after the first visit. CSV and JSON exports keep the record portable. This tool does not diagnose symptoms or recommend treatment.

## Use it

- Open `/log` to start a real private log.
- Open `/demo` to try the isolated sample. Nothing in demo mode reaches the real log.
- Use **Open printable brief** before an appointment.
- Use **Export backup** or **Download encrypted backup** to keep a copy.

## Develop and verify

```sh
npm install
npm run dev
npm test
npm run build
```

The deploy output is `dist/`, with `index.html` at its root. The claim tests and their demo instructions are in `.factory/claims.json` and `.factory/demo.md`.

## Optional one-time unlock

The core log and all data exports are free. A $12 one-time unlock adds a personal cover note to printed briefs and supports maintenance. Checkout and license verification use Sociobot; no payment provider is embedded in the app.

## Privacy and terms

Read `/privacy` for local storage and optional license verification. Read `/terms` for the medical disclaimer and purchase terms.
