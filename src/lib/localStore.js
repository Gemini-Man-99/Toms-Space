/*
 * Local mode: used when no Supabase keys are set (see .env.example).
 *
 * Entries are saved in IndexedDB, which lives inside ONE browser on ONE device:
 * they survive a refresh for you, but nobody else who opens the site will see
 * them. Handy while developing; for a public site use remoteStore.js.
 *
 * Shape of a project (same as remoteStore.js returns):
 *   { id, category, name, description, tools[], liveUrl, githubUrl,
 *     image (data URL), video (Blob | null), createdAt }
 */

const DB_NAME = 'toms-space';
const STORE = 'projects';

let dbPromise;

function openDb() {
  dbPromise ??= new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available'));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const store = request.result.createObjectStore(STORE, { keyPath: 'id' });
      store.createIndex('category', 'category');
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      dbPromise = undefined;
      reject(request.error);
    };
  });
  return dbPromise;
}

function run(mode, action) {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE, mode);
        const request = action(transaction.objectStore(STORE));
        transaction.oncomplete = () => resolve(request.result);
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error);
      }),
  );
}

/** Newest first. */
export function listProjects(category) {
  return run('readonly', (store) => store.index('category').getAll(category)).then((rows) =>
    rows.sort((a, b) => b.createdAt - a.createdAt),
  );
}

/** Resolves with the saved project. */
export function addProject(project) {
  return run('readwrite', (store) => store.add(project)).then(() => project);
}

export function removeProject(id) {
  return run('readwrite', (store) => store.delete(id));
}
