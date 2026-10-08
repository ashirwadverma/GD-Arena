import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { SessionData } from './types';

interface GDArenaDB extends DBSchema {
  sessions: {
    key: string;
    value: SessionData;
    indexes: { 'by-date': string };
  };
}

const DB_NAME = 'gd-arena-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<GDArenaDB>> | null = null;

function getDB() {
  if (typeof window === 'undefined') return null;
  if (!dbPromise) {
    dbPromise = openDB<GDArenaDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('sessions')) {
          const store = db.createObjectStore('sessions', { keyPath: 'id' });
          store.createIndex('by-date', 'createdAt');
        }
      },
    });
  }
  return dbPromise;
}

export async function saveSessionToDb(session: SessionData): Promise<void> {
  const db = await getDB();
  if (!db) return;
  await db.put('sessions', session);
}

export async function getAllSessionsFromDb(): Promise<SessionData[]> {
  const db = await getDB();
  if (!db) return [];
  const sessions = await db.getAllFromIndex('sessions', 'by-date');
  return sessions.reverse(); // Newest first
}

export async function getSessionByIdFromDb(id: string): Promise<SessionData | undefined> {
  const db = await getDB();
  if (!db) return undefined;
  return await db.get('sessions', id);
}

export async function deleteSessionFromDb(id: string): Promise<void> {
  const db = await getDB();
  if (!db) return;
  await db.delete('sessions', id);
}
