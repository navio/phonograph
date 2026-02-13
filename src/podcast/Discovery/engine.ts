import PodcastSearcher, { PodcastSearchResponse } from "./PodcastSearcher";

export interface PodcastSearchResult {
  title: string;
  rss: string;
  publisher?: string;
  thumbnail?: string;
  tag?: unknown;
}

export interface PopularPodcastsResponse {
  top: PodcastSearchResult[];
  loading: boolean;
  init: number;
  name: string | null;
  error?: boolean;
  errorMessage?: string;
}

const API = "/ln/";
const SFP = new PodcastSearcher(API);

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

  const term = encodeURIComponent(search || "");
  try {
    const data = await SFP.apple(term);
    const podcasts = normalizeApple(data);
    if (podcasts.length > 0) return podcasts;
  } catch {
    // Apple search failed, fall through to Listen Notes
  }
  try {
    const lnData = await SFP.search(term);
    return normalizeListenNotes(lnData as PodcastSearchResponse);
  } catch {
    return [];
  }
};

const URI = "https://www.listennotes.com/c/r/";
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
  try {
    const params = new URLSearchParams({ page: "1", region: "us" });
    if (query !== null) params.set("genre_id", String(query));
    const resp = await fetch(`/ln/best_podcasts?${params}`);
    if (!resp.ok) {
      throw new Error(`Listen Notes best_podcasts failed: ${resp.status}`);
    }
    const data = await resp.json();
    const { podcasts = [], name } = data;
    const cleanedCasts: PodcastSearchResult[] = podcasts.map((podcast: any, num: number) => {
      const {
        title,
        domain,
        thumbnail,
        description,
        id,
        total_episodes: episodes,
        earliest_pub_date_ms: startDate,
        publisher,
      } = podcast;
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
    if (!query) memory = response;
    return response;
  } catch (error: any) {
    console.error("getPopularPodcasts failed:", error);
    const fallbackInit = query !== null ? Number(query) : 0;
    return { top: [], loading: false, init: Number.isFinite(fallbackInit) ? fallbackInit : 0, name: null, error: true, errorMessage: String(error?.message || error) };
  }
};
