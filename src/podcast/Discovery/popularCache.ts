import type { PopularPodcastsResponse } from "./engine";

// 10 days TTL to minimize Listen Notes API calls (limited to 300/month)
const TEN_DAYS_MS = 1000 * 60 * 60 * 24 * 10;

type CachedValue<T> = {
  cachedAt: number;
  value: T;
};

const canUseIndexedDb = () => {
  // Avoid using IDB in SSR/tests.
  return typeof indexedDB !== "undefined";
};

let idbPromise: Promise<typeof import("idb-keyval")> | null = null;
const getIdb = async () => {
  if (!canUseIndexedDb()) return null;
  if (!idbPromise) idbPromise = import("idb-keyval");
  return await idbPromise;
};

export const bestPodcastsCacheKey = (genreId: number | null, params?: { region?: string; page?: string }) => {
  const region = params?.region || "us";
  const page = params?.page || "1";
  const g = genreId === null ? "all" : String(genreId);
  return `ln:best_podcasts:region=${region}:page=${page}:genre=${g}`;
};

export const getCachedBestPodcasts = async (key: string): Promise<PopularPodcastsResponse | null> => {
  try {
    const idb = await getIdb();
    if (!idb) return null;

    const cached = (await idb.get(key)) as CachedValue<PopularPodcastsResponse> | undefined;
    if (!cached || !cached.value) return null;

    const isFresh = Date.now() - cached.cachedAt < TEN_DAYS_MS;
    return isFresh ? cached.value : null;
  } catch {
    return null;
  }
};

export const setCachedBestPodcasts = async (key: string, value: PopularPodcastsResponse): Promise<void> => {
  try {
    const idb = await getIdb();
    if (!idb) return;

    const payload: CachedValue<PopularPodcastsResponse> = {
      cachedAt: Date.now(),
      value,
    };

    await idb.set(key, payload);
  } catch {
    // ignore cache write failures
  }
};
