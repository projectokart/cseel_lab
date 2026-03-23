// src/lib/experimentCache.ts
import { supabase } from "@/integrations/supabase/client";

// ── TYPES ─────────────────────────────────────────────────────────────────────
export interface ExpBasic {
  id: string;
  title: string;
  subject: string;
  class: string | null;
  thumbnail_url: string | null;
  popularity: number | null;
  created_at: string;
}

export interface ExpDetail {
  id: string;
  title: string;
  subject: string;
  class: string | null;
  difficulty: string | null;
  description: string | null;
  thumbnail_url: string | null;
  images?: string[] | null;
  video_link: string | null;
  demo_link: string | null;
  materials: string | null;
  procedure: string | null;
  outcome: string | null;
}

// ── INDEXEDDB CONFIG ──────────────────────────────────────────────────────────
const DB_NAME      = "cseel_v1";
const DB_VERSION   = 1;
const LIST_STORE   = "exp_list";
const DETAIL_STORE = "exp_detail";
const MAX_DETAIL   = 100;

// ── MEMORY CACHE ──────────────────────────────────────────────────────────────
const memList   = new Map<string, ExpBasic[]>();
const memDetail = new Map<string, ExpDetail>();

// ── LISTENERS ─────────────────────────────────────────────────────────────────
type ListListener = (data: ExpBasic[]) => void;
const listListeners: Set<ListListener> = new Set();

// ── INDEXEDDB ─────────────────────────────────────────────────────────────────
let _db: IDBDatabase | null = null;

async function getDB(): Promise<IDBDatabase> {
  if (_db) return _db;
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = e => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(LIST_STORE))
        db.createObjectStore(LIST_STORE);
      if (!db.objectStoreNames.contains(DETAIL_STORE))
        db.createObjectStore(DETAIL_STORE);
    };
    req.onsuccess = e => {
      _db = (e.target as IDBOpenDBRequest).result;
      resolve(_db!);
    };
    req.onerror = () => reject(req.error);
  });
}

async function idbGet<T>(store: string, key: string): Promise<T | null> {
  try {
    const db = await getDB();
    return new Promise(resolve => {
      const req = db.transaction(store, "readonly").objectStore(store).get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror   = () => resolve(null);
    });
  } catch { return null; }
}

async function idbSet<T>(store: string, key: string, value: T): Promise<void> {
  try {
    const db = await getDB();
    await new Promise<void>(resolve => {
      const tx = db.transaction(store, "readwrite");
      tx.objectStore(store).put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror    = () => resolve();
    });
  } catch {}
}

async function idbDelete(store: string, key: string): Promise<void> {
  try {
    const db = await getDB();
    await new Promise<void>(resolve => {
      const tx = db.transaction(store, "readwrite");
      tx.objectStore(store).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror    = () => resolve();
    });
  } catch {}
}

async function idbGetAllKeys(store: string): Promise<string[]> {
  try {
    const db = await getDB();
    return new Promise(resolve => {
      const req = db.transaction(store, "readonly").objectStore(store).getAllKeys();
      req.onsuccess = () => resolve(req.result as string[]);
      req.onerror   = () => resolve([]);
    });
  } catch { return []; }
}

async function idbCount(store: string): Promise<number> {
  try {
    const db = await getDB();
    return new Promise(resolve => {
      const req = db.transaction(store, "readonly").objectStore(store).count();
      req.onsuccess = () => resolve(req.result);
      req.onerror   = () => resolve(0);
    });
  } catch { return 0; }
}

// ── LRU EVICTION ──────────────────────────────────────────────────────────────
async function evictIfNeeded(): Promise<void> {
  const count = await idbCount(DETAIL_STORE);
  if (count <= MAX_DETAIL) return;
  const keys = await idbGetAllKeys(DETAIL_STORE);
  if (keys[0]) {
    await idbDelete(DETAIL_STORE, keys[0]);
    memDetail.delete(keys[0]);
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// PUBLIC API
// ══════════════════════════════════════════════════════════════════════════════

// ── GET LIST ──────────────────────────────────────────────────────────────────
export async function getExperimentList(): Promise<ExpBasic[]> {
  // Layer 1: Memory
  if (memList.has("all")) {
    revalidateListBg();
    return memList.get("all")!;
  }
  // Layer 2: IndexedDB
  const cached = await idbGet<ExpBasic[]>(LIST_STORE, "all");
  if (cached?.length) {
    memList.set("all", cached);
    revalidateListBg();
    return cached;
  }
  // Layer 3: Supabase
  return fetchList();
}

async function fetchList(): Promise<ExpBasic[]> {
  const { data } = await supabase
    .from("experiments")
    .select("id,title,subject,class,thumbnail_url,popularity,created_at")
    .eq("is_active", true)
    .order("popularity", { ascending: false });

  const list = (data || []) as ExpBasic[];
  memList.set("all", list);
  await idbSet(LIST_STORE, "all", list);
  return list;
}

function revalidateListBg() {
  setTimeout(async () => {
    try {
      const { data } = await supabase
        .from("experiments")
        .select("id,title,subject,class,thumbnail_url,popularity,created_at")
        .eq("is_active", true)
        .order("popularity", { ascending: false });

      if (!data) return;
      const fresh = data as ExpBasic[];
      const current = memList.get("all") || [];
      if (JSON.stringify(fresh) !== JSON.stringify(current)) {
        memList.set("all", fresh);
        await idbSet(LIST_STORE, "all", fresh);
        listListeners.forEach(fn => fn(fresh));
      }
    } catch {}
  }, 1000);
}

// ── GET DETAIL ────────────────────────────────────────────────────────────────
export async function getExperimentDetail(id: string): Promise<ExpDetail | null> {
  // Layer 1: Memory
  if (memDetail.has(id)) return memDetail.get(id)!;

  // Layer 2: IndexedDB
  const cached = await idbGet<ExpDetail>(DETAIL_STORE, id);
  if (cached) {
    memDetail.set(id, cached);
    return cached;
  }

  // Layer 3: Supabase
  const { data } = await supabase
    .from("experiments")
    .select("id,title,subject,class,difficulty,description,thumbnail_url,video_link,demo_link,materials,procedure,outcome")
    .eq("id", id)
    .single();

  if (!data) return null;

  const detail = data as ExpDetail;
  memDetail.set(id, detail);
  await idbSet(DETAIL_STORE, id, detail);
  await evictIfNeeded();
  return detail;
}

// ── SUBSCRIBE ─────────────────────────────────────────────────────────────────
export function onListUpdate(fn: ListListener) {
  listListeners.add(fn);
  return () => listListeners.delete(fn);
}

// ── REALTIME SYNC ─────────────────────────────────────────────────────────────
let realtimeStarted = false;

export function startRealtimeSync() {
  if (realtimeStarted) return;
  realtimeStarted = true;

  supabase
    .channel("exp_realtime")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "experiments" },
      async (payload) => {
        const { eventType, new: newRow, old: oldRow } = payload;

        if (eventType === "INSERT" || eventType === "UPDATE") {
          const row = newRow as any;

          // Detail cache update
          if (memDetail.has(row.id)) {
            const detail = row as ExpDetail;
            memDetail.set(row.id, detail);
            await idbSet(DETAIL_STORE, row.id, detail);
          }

          // List cache update
          const list = memList.get("all") || [];
          const basic: ExpBasic = {
            id: row.id,
            title: row.title,
            subject: row.subject,
            class: row.class,
            thumbnail_url: row.thumbnail_url,
            popularity: row.popularity,
            created_at: row.created_at,
          };
          const idx = list.findIndex(e => e.id === row.id);
          const newList = idx >= 0
            ? list.map(e => e.id === row.id ? basic : e)
            : [...list, basic];

          memList.set("all", newList);
          await idbSet(LIST_STORE, "all", newList);
          listListeners.forEach(fn => fn(newList));
        }

        if (eventType === "DELETE") {
          const id = (oldRow as any).id;
          memDetail.delete(id);
          await idbDelete(DETAIL_STORE, id);
          const newList = (memList.get("all") || []).filter(e => e.id !== id);
          memList.set("all", newList);
          await idbSet(LIST_STORE, "all", newList);
          listListeners.forEach(fn => fn(newList));
        }
      }
    )
    .subscribe();
}

// ── CLEAR CACHE ───────────────────────────────────────────────────────────────
export async function clearCache(): Promise<void> {
  memList.clear();
  memDetail.clear();
  try {
    const db = await getDB();
    const tx = db.transaction([LIST_STORE, DETAIL_STORE], "readwrite");
    tx.objectStore(LIST_STORE).clear();
    tx.objectStore(DETAIL_STORE).clear();
  } catch {}
}