import { openDB } from 'idb';

const DB_NAME = 'agrishield_db';
const DB_VERSION = 1;

export async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('outbox')) {
        db.createObjectStore('outbox', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('listings')) {
        db.createObjectStore('listings', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('scans')) {
        db.createObjectStore('scans', { keyPath: 'id' });
      }
    },
  });
}

export async function queueOfflineAction(action) {
  const db = await getDB();
  const item = {
    ...action,
    timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    synced: false,
  };
  return db.add('outbox', item);
}

export async function getOutboxItems() {
  const db = await getDB();
  return db.getAll('outbox');
}

export async function clearSyncedOutbox() {
  const db = await getDB();
  const tx = db.transaction('outbox', 'readwrite');
  await tx.objectStore('outbox').clear();
  await tx.done;
}
