import PodcastSearcher, { PodcastSearchResponse } from "./PodcastSearcher";
import { appleCacheKey, getBrowserCached, setBrowserCached } from "./appleBrowserCache";
import { bestPodcastsCacheKey, getCachedBestPodcasts, setCachedBestPodcasts } from "./popularCache";
import platform from "../../platform";

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

  const normalizeListenNotes = (data: PodcastSearchResponse = {} as PodcastSearchResponse): PodcastSearchResult[] => {
    const { results = [] } = data;
    return results
      .filter((podcast) => podcast && podcast.rss)
      .map((podcast: any) => {
        const { rss, publisher_original, title_original, thumbnail, genre_ids } = podcast;
        return {
          title: title_original,
          rss,
          publisher: publisher_original,
          thumbnail,
          tag: genre_ids,
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
    if (podcasts.length > 0) {
      await setBrowserCached(cacheKey, podcasts);
      return podcasts;
    }
  } catch {
    // fall through to Listen Notes
  }

  try {
    const lnData = await SFP.search(term);
    return normalizeListenNotes(lnData as PodcastSearchResponse);
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

  // Default view (Top) comes from Apple Marketing Tools.
  if (query === null) {
    const storefront = "us";
    const limit = 25;
    const cacheKey = appleCacheKey({ kind: "top", storefront, limit, feed: "podcasts" });
    const cached = await getBrowserCached<PopularPodcastsResponse>(cacheKey);
    if (cached) return cached;

    try {
      const resp = await fetch(platform.resolveBackendUrl(`/apple/rss/${storefront}/podcasts/top/${limit}/podcasts.json`));
      if (!resp.ok) throw new Error(`Apple top failed: ${resp.status}`);
      const data = await resp.json();
      const results = (data && data.feed && data.feed.results) || [];

      const cleanedCasts: PodcastSearchResult[] = (results || []).map((item: any, num: number) => {
        const id = item && item.id;
        const title = item && item.name;
        const publisher = item && item.artistName;
        const thumbnail = item && item.artworkUrl100;
        const itunesUrl = item && item.url;
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

      const response: PopularPodcastsResponse = {
        top: cleanedCasts,
        loading: false,
        init: 0,
        name: (data && data.feed && data.feed.title) || "Top",
      };

      memory = response;
      await setBrowserCached(cacheKey, response);
      return response;
    } catch (error: any) {
      console.error("getPopularPodcasts (apple top) failed:", error);
      return { top: [], loading: false, init: 0, name: null, error: true, errorMessage: String(error?.message || error) };
    }
  }

  // Genres (and other list views) fall back to Listen Notes.
  const params = new URLSearchParams({ page: "1", region: "us" });
  if (query !== null) params.set("genre_id", String(query));

  const lnCacheKey = bestPodcastsCacheKey(query, { region: "us", page: "1" });
  const cachedLn = await getCachedBestPodcasts(lnCacheKey);
  if (cachedLn) return cachedLn;

  const URI = "https://www.listennotes.com/c/r/";
  try {
    const resp = await fetch(platform.resolveBackendUrl(`/ln/best_podcasts?${params}`));
    if (!resp.ok) throw new Error(`Listen Notes best_podcasts failed: ${resp.status}`);
    const data = await resp.json();
    const { podcasts = [], name } = data;
    const cleanedCasts: PodcastSearchResult[] = podcasts.map((podcast: any, num: number) => {
      const { title, domain, thumbnail, description, id, total_episodes: episodes, earliest_pub_date_ms: startDate, publisher } = podcast;
      const rss = `${URI}${id}`;
      return {
        title: `${num + 1}. ${title}`,
        thumbnail,
        domain,
        description,
        rss,
        episodes,
        startDate,
        publisher,
      } as PodcastSearchResult;
    });

    const initValue = query !== null ? Number(query) : 0;
    const response: PopularPodcastsResponse = {
      top: cleanedCasts,
      loading: false,
      init: Number.isFinite(initValue) ? initValue : 0,
      name,
    };

    await setCachedBestPodcasts(lnCacheKey, response);
    return response;
  } catch (error: any) {
    console.error("getPopularPodcasts (listennotes) failed:", error);
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

  const resp = await fetch(platform.resolveBackendUrl(`/apple/lookup?id=${encodeURIComponent(id)}`));
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

  const resp = await fetch(platform.resolveBackendUrl("/apple/genres?id=26"));
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
