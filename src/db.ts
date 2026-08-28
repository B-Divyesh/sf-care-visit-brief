import type { Entry } from './types';

const DB = 'care-visit-brief';
const STORE = 'entries';

function key(demo: boolean) { return demo ? 'demo:entries' : 'real:entries'; }

/** Serializes complete-log mutations across tabs before opening IndexedDB. */
async function withWriteLock<T>(demo: boolean, work: () => Promise<T>): Promise<T> {
  const locks = typeof navigator !== 'undefined' ? navigator.locks : undefined;
  if (!locks) return work();
  return locks.request(`care-visit-brief:${key(demo)}`, { mode: 'exclusive' }, work);
}

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
  return withWriteLock(demo, async () => {
    const db = await openDb();
    return new Promise<void>((resolve, reject) => {
      const request = db.transaction(STORE, 'readwrite').objectStore(STORE).put(entries, key(demo));
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });
}

export async function clearEntries(demo: boolean) { await saveEntries(demo, []); }

/**
 * Applies a change against the latest stored value in one read/write
 * transaction.  This matters when the same log is open in two tabs: each
 * writer sees the record written by the tab before it instead of replacing it
 * with an old in-memory snapshot.
 */
export async function updateEntries(demo: boolean, change: (current: Entry[]) => Entry[]): Promise<Entry[]> {
  return withWriteLock(demo, async () => {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE, 'readwrite');
      const store = transaction.objectStore(STORE);
      const request = store.get(key(demo));
      let next: Entry[] = [];
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        try {
          next = change((request.result ?? []) as Entry[]);
          store.put(next, key(demo));
        } catch (error) {
          transaction.abort();
          reject(error);
        }
      };
      transaction.oncomplete = () => resolve(next);
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  });
}
