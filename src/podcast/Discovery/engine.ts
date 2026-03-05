import PodcastSearcher, { PodcastSearchResponse } from "./PodcastSearcher";
import { appleCacheKey, getBrowserCached, setBrowserCached } from "./appleBrowserCache";

export interface PodcastSearchResult {
  title: string;
  rss: string;
  publisher?: string;
  thumbnail?: string;
  tag?: unknown;
  appleId?: string;
  itunesUrl?: string;
}

export interface PopularPodcastsResponse {
  top: PodcastSearchResult[];
  loading: boolean;
  init: number;
  name: string | null;
  error?: boolean;
  errorMessage?: string;
}

export interface PodcastGenre {
  id: number;
  name: string;
  parent_id?: number | null;
}

const SFP = new PodcastSearcher();

export const searchForPodcasts = async function (search?: string): Promise<PodcastSearchResult[]> {
  const normalizeApple = (data: PodcastSearchResponse = {} as PodcastSearchResponse): PodcastSearchResult[] => {
    const { results = [] } = data;
    return results
      .filter((podcast) => podcast && podcast.feedUrl)
      .map((podcast: any) => {
        const { feedUrl, artistName, artworkUrl100, trackName, genres } = podcast;
        return {
          title: trackName,
          rss: feedUrl,
          publisher: artistName,
          thumbnail: artworkUrl100,
          tag: genres,
        };
      });
  };

  const term = (search || "").trim();
  try {
    const cacheKey = appleCacheKey({ kind: "search", term });
    const cached = await getBrowserCached<PodcastSearchResult[]>(cacheKey);
    if (cached) return cached;

    const data = await SFP.apple(term);
    const podcasts = normalizeApple(data);
    await setBrowserCached(cacheKey, podcasts);
    return podcasts;
  } catch {
    return [];
  }
};

let memory: PopularPodcastsResponse = {
  top: [],
  loading: false,
  init: 0,
  name: null,
};

export const getPopularPodcasts = async function (query: number | null = null): Promise<PopularPodcastsResponse> {
  if (memory && memory.top.length > 0 && query === null) {
    return memory;
  }

  const storefront = "us";
  const limit = 25;
  const genre = query === null || query === 0 ? "all" : String(query);

  // Browser (IndexedDB) cache: 3 days TTL.
  const cacheKey = appleCacheKey({ kind: "top-podcasts", storefront, genre, limit });
  const cached = await getBrowserCached<PopularPodcastsResponse>(cacheKey);
  if (cached) return cached;

  try {
    const resp = await fetch(`/apple/rss/podcasts/${storefront}/top-podcasts/${genre}/${limit}/json`);
    if (!resp.ok) {
      throw new Error(`Apple top-podcasts failed: ${resp.status}`);
    }
    const data = await resp.json();
    const results = (data && (data.feed && data.feed.results)) || data.results || [];
    const cleanedCasts: PodcastSearchResult[] = (results || []).map((item: any, num: number) => {
      const id = item && (item.id || item.podcastId || item.collectionId);
      const title = item && (item.name || item.title || item.trackName);
      const publisher = item && (item.artistName || item.publisher || item.artist);
      const thumbnail = item && (item.artworkUrl100 || item.artworkUrl60 || item.thumbnail || item.image);
      const itunesUrl = item && (item.url || item.itunesUrl || item.link);
      const genres = item && item.genres;

      return {
        title: `${num + 1}. ${title || ""}`.trim(),
        rss: "",
        publisher,
        thumbnail,
        tag: genres,
        appleId: id ? String(id) : undefined,
        itunesUrl: itunesUrl ? String(itunesUrl) : undefined,
      } as PodcastSearchResult;
    });

    const initValue = query !== null ? Number(query) : 0;
    const response: PopularPodcastsResponse = {
      top: cleanedCasts,
      loading: false,
      init: Number.isFinite(initValue) ? initValue : 0,
      name: null,
    };

    // Keep existing in-memory optimization for the default view.
    if (!query) memory = response;

    await setBrowserCached(cacheKey, response);

    return response;
  } catch (error: any) {
    console.error("getPopularPodcasts failed:", error);
    const fallbackInit = query !== null ? Number(query) : 0;
    return { top: [], loading: false, init: Number.isFinite(fallbackInit) ? fallbackInit : 0, name: null, error: true, errorMessage: String(error?.message || error) };
  }
};

export const resolveApplePodcastFeedUrl = async (appleId: string): Promise<string | null> => {
  const id = String(appleId || "").trim();
  if (!id) return null;

  const cacheKey = appleCacheKey({ kind: "lookup", id });
  const cached = await getBrowserCached<string>(cacheKey);
  if (cached) return cached;

  const resp = await fetch(`/apple/lookup?id=${encodeURIComponent(id)}`);
  if (!resp.ok) return null;
  const data = await resp.json();
  const result = (data && data.results && data.results[0]) || null;
  const feedUrl = result && result.feedUrl;
  if (feedUrl && typeof feedUrl === "string") {
    await setBrowserCached(cacheKey, feedUrl);
    return feedUrl;
  }
  return null;
};

const findNodeById = (value: any, id: number, depth = 0): any => {
  if (!value || depth > 8) return null;
  if (typeof value !== "object") return null;
  if (Number(value.id) === id) return value;

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findNodeById(item, id, depth + 1);
      if (found) return found;
    }
    return null;
  }

  for (const k of Object.keys(value)) {
    const found = findNodeById(value[k], id, depth + 1);
    if (found) return found;
  }
  return null;
};

export const getApplePodcastGenres = async (): Promise<PodcastGenre[]> => {
  const cacheKey = appleCacheKey({ kind: "genres", id: 26 });
  const cached = await getBrowserCached<PodcastGenre[]>(cacheKey);
  if (cached) return cached;

  const resp = await fetch(`/apple/genres?id=26`);
  if (!resp.ok) return [];
  const data = await resp.json();

  const root =
    (data && (data[26] || data["26"])) ||
    findNodeById(data, 26) ||
    null;
  const sub = (root && (root.subgenres || root.genres || root.children)) || null;

  let genres: PodcastGenre[] = [];
  if (sub && typeof sub === "object") {
    genres = Object.entries(sub)
      .map(([key, node]: [string, any]) => {
        const id = Number(node && (node.id || key));
        const name = String((node && node.name) || "").trim();
        if (!Number.isFinite(id) || !name) return null;
        return { id, name, parent_id: 26 } as PodcastGenre;
      })
      .filter(Boolean) as PodcastGenre[];
  }

  const sorted = [...genres].sort((a, b) => (a?.name || "").localeCompare(b?.name || ""));
  await setBrowserCached(cacheKey, sorted);
  return sorted;
};
