import type { Entry } from './types';

const DB = 'care-visit-brief';
const STORE = 'entries';

function key(demo: boolean) { return demo ? 'demo:entries' : 'real:entries'; }

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadEntries(demo: boolean): Promise<Entry[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE).objectStore(STORE).get(key(demo));
    request.onsuccess = () => resolve((request.result ?? []) as Entry[]);
    request.onerror = () => reject(request.error);
  });
}

export async function saveEntries(demo: boolean, entries: Entry[]) {
  const db = await openDb();
  return new Promise<void>((resolve, reject) => {
    const request = db.transaction(STORE, 'readwrite').objectStore(STORE).put(entries, key(demo));
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function clearEntries(demo: boolean) { await saveEntries(demo, []); }
