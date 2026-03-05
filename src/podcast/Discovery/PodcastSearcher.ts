export interface PodcastSearchResponse {
  results?: Array<Record<string, any>>;
  [key: string]: any;
}

export default class PodcastSearcher {
  private currentRequest: AbortController | null;

  constructor() {
    this.currentRequest = null;
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
      fetch(`/ln/search?type=podcast&q=${encodeURIComponent(term)}`, { signal })
        .then((result) => (result.ok && result.json().then(accept).catch(reject)) || reject(result))
        .catch(reject)
    );
  }

  listennotes(term: string): Promise<PodcastSearchResponse> {
    return this.querySearch(`/ln/typeahead?q=${encodeURIComponent(term)}&show_podcasts=1`);
  }

  apple(term: string): Promise<PodcastSearchResponse> {
    return this.querySearch(`/apple/search?term=${encodeURIComponent(term)}`);
  }
}
