# Care Visit Brief design thesis

## Direction

**Handwritten lab notebook.** A care visit needs evidence that feels personal, not clinical machinery. The interface borrows the calm structure of a field notebook: warm paper, blue-black ink, a restrained red pencil mark for urgency, date rules, and clipped note cards. It makes tiny daily observations feel credible enough to hand to a clinician.

## Tokens and type

- Paper `#f7f1e5`, paper shadow `#e7dcc8`, card `#fffdf7`
- Ink `#1e2b3b`, muted ink `#53606b`, rule blue `#6c8598`
- Oxide accent `#9b3f35` with light foreground `#ffffff`; moss success `#315f4d`; warning `#8a571c`
- Display: Georgia, `Times New Roman`, serif — familiar margin-note character.
- Body: system sans (`Inter` is deliberately not loaded); clear device-native text keeps the installed tool quick and private.
- 8px spacing scale; generous 24–40px paper margins; 18px body text.

## Interaction and motion

Cards look clipped to paper with a small pseudo-element tab. Severity chips leave an ink-dot trail, and a newly saved entry settles with a 180ms vertical movement. Text remains fully opaque throughout so contrast does not dip during motion. No progress meters or animated health claims. Under reduced motion all transitions become instant.

## Asset plan and provenance

The landing page uses one original generated still-life: an open ruled notebook with a simple symptom timeline, pencil, small medicine bottle silhouette, and a clipped blank visit note. It is atmosphere only; no text in the image is needed to use the product. Prompt sheet: warm editorial top-down still life, off-white paper, blue-black ink, muted oxide red, natural side light, tactile grain; no people, brands, readable text, watermark, logo, or medical diagnosis imagery. Generated with the factory image tool on 2026-08-28; original product asset. The reviewed source and prompt sidecar are in `assets/src/notebook-hero-source.png` and `assets/src/notebook-hero-source.png.json`; the shipped `public/assets/notebook-hero.webp` is 50 KB.

## Accessibility and dark treatment

This is intentionally a light-paper product: paper is a task cue, not a theme preference. The palette is explicitly painted, and system high-contrast colors remain legible. Text and interactive outlines use ink/oxide values that meet the stated contrast target. Focus is a 3px ink outline with a paper offset.

## Polish round 1 extensions

The demo preview uses the same oxide margin rule, paper shadow, serif date, and clipped-sheet geometry as saved notes. The A4 visit brief removes app chrome but keeps the ink, oxide rule, and ruled chronology. This makes the sample visible sooner without introducing a second visual language. Mobile navigation keeps 8px between 44px targets. No new image asset was needed; the original generated still-life and its provenance remain unchanged.
