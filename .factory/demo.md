# Demo sandbox

Open `/?demo=1` for the canonical one-click demo. `/demo` remains a supported direct alias.

The demo seeds five realistic symptom notes in IndexedDB under the `demo:entries` key. Real notes use `real:entries`; demo mode never reads or writes that key. Any optional demo license, license verdict, and cover note use `demo:`-prefixed `localStorage` keys. Leaving demo mode discards those values and removes `demo:entries`; it never changes `real:entries`.

The first mobile viewport shows the latest sample note above the form. The persistent banner says “Demo — sample data, nothing is saved.” Use **Reset demo** to recreate all five notes. Use **Start my private timeline** to discard the demo and open `/log`.

The service worker caches the app shell. The sample ships in the JavaScript bundle, so it opens offline after the first visit.
