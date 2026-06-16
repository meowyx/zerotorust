import { useCallback, useSyncExternalStore } from "react";
import { WATCHED_STORAGE_KEY } from "@/lib/episodes";

// Per-series set of watched episode numbers, e.g. { s1: ["01", "03"] }.
export type WatchedMap = Record<string, string[]>;

// A tiny localStorage-backed external store. Using useSyncExternalStore (rather
// than useEffect + setState) reads the saved progress without an effect and
// stays hydration-safe: the server and the initial client render both use the
// empty server snapshot, then React re-reads localStorage after hydration.

const EMPTY: WatchedMap = {};
let cache: WatchedMap | null = null;
const listeners = new Set<() => void>();

function read(): WatchedMap {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(WATCHED_STORAGE_KEY);
    return raw ? ((JSON.parse(raw) as WatchedMap) ?? EMPTY) : EMPTY;
  } catch {
    return EMPTY;
  }
}

function getSnapshot(): WatchedMap {
  if (cache === null) cache = read();
  return cache;
}

function getServerSnapshot(): WatchedMap {
  return EMPTY;
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  // Keep multiple tabs in sync.
  const onStorage = (e: StorageEvent) => {
    if (e.key === WATCHED_STORAGE_KEY) {
      cache = read();
      listeners.forEach((l) => l());
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

function write(next: WatchedMap) {
  cache = next;
  try {
    localStorage.setItem(WATCHED_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore (private mode, quota, etc.)
  }
  listeners.forEach((l) => l());
}

export function useWatched() {
  const watched = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const setWatched = useCallback((next: WatchedMap) => write(next), []);
  return [watched, setWatched] as const;
}
