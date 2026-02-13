const DEBUG = !process.env.NODE_ENV || process.env.NODE_ENV === "development";

export interface PodcastSearchResponse {
  results?: Array<Record<string, any>>;
  [key: string]: any;
}

export default class PodcastSearcher {
  private currentRequest: AbortController | null;
  private API: string;
  private prodProxy: string;

  constructor(API: string) {
    this.currentRequest = null;
    this.API = API;
    this.prodProxy = !DEBUG ? "/rss-full/?term=" : "";
  }

  querySearch(url: string): Promise<PodcastSearchResponse> {
    if (this.currentRequest) this.currentRequest.abort();
    this.currentRequest = new AbortController();
    const { signal } = this.currentRequest;

    const headers = {
      "User-Agent": "podcastsuite",
      Accept: "application/json",
    };

    return fetch(url, { headers, signal }).then(async (results) => {
      const text = await results.text();
      if (!results.ok || !text) return {} as PodcastSearchResponse;
      try {
        return JSON.parse(text) as PodcastSearchResponse;
      } catch {
        return {} as PodcastSearchResponse;
      }
    });
  }

  search(term: string): Promise<PodcastSearchResponse> {
    if (this.currentRequest) this.currentRequest.abort();
    this.currentRequest = new AbortController();
    const { signal } = this.currentRequest;
    return new Promise((accept, reject) =>
      fetch(`${this.API}search?type=podcast&q=${encodeURIComponent(term)}`, { signal })
        .then(
          (result) =>
            (result.ok && result.json().then(accept).catch(reject)) || reject(result)
        )
        .catch(reject)
    );
  }

  listennotes(term: string): Promise<PodcastSearchResponse> {
    return this.querySearch(
      `${this.API}typeahead?q=${encodeURIComponent(term)}&show_podcasts=1`
    );
  }

  apple(term: string): Promise<PodcastSearchResponse> {
    return this.querySearch(`/search/?term=${encodeURIComponent(term)}`);
  }
}
