const THREE_DAYS_MS = 1000 * 60 * 60 * 24 * 3;

type CachedValue<T> = {
  cachedAt: number;
  value: T;
};

const canUseIndexedDb = () => typeof indexedDB !== "undefined";

let idbPromise: Promise<typeof import("idb-keyval")> | null = null;
const getIdb = async () => {
  if (!canUseIndexedDb()) return null;
  if (!idbPromise) idbPromise = import("idb-keyval");
  return await idbPromise;
};

export const getBrowserCached = async <T,>(key: string, ttlMs: number = THREE_DAYS_MS): Promise<T | null> => {
  try {
    const idb = await getIdb();
    if (!idb) return null;

    const cached = (await idb.get(key)) as CachedValue<T> | undefined;
    if (!cached) return null;

    const isFresh = Date.now() - cached.cachedAt < ttlMs;
    return isFresh ? cached.value : null;
  } catch {
    return null;
  }
};

export const setBrowserCached = async <T,>(key: string, value: T): Promise<void> => {
  try {
    const idb = await getIdb();
    if (!idb) return;
    const payload: CachedValue<T> = { cachedAt: Date.now(), value };
    await idb.set(key, payload);
  } catch {
    // ignore cache write failures
  }
};

export const appleCacheKey = (parts: Record<string, string | number | null | undefined>) => {
  const entries = Object.entries(parts)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}=${v === null ? "null" : String(v)}`)
    .sort();
  return `apple:${entries.join(":")}`;
};

export const THREE_DAYS_TTL_MS = THREE_DAYS_MS;
