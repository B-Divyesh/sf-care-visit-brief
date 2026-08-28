# Demo sandbox

Open `/demo` or `/?demo=1` is not used; the canonical demo entry is `/demo`.

The demo seeds five realistic symptom entries in IndexedDB under the `demo:entries` key. Real entries use `real:entries`; demo mode never reads or writes that key. The persistent banner says “Demo — sample data, nothing is saved.” Use **Reset demo** to recreate the sample. **Start for real** discards the demo namespace and opens `/log`.

The service worker caches the app shell and the sample is embedded in the JavaScript bundle, so the same demo is testable after a first online visit with the browser offline.
