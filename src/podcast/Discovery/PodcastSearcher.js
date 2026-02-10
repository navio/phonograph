const DEBUG = !process.env.NODE_ENV || process.env.NODE_ENV === "development";

export default class PodcastSearcher {
  constructor(API) {
    this.currentRequest = null;
    this.API = API;
    this.prodProxy = !DEBUG ? "/rss-full/?term=" : "";
  }

  querySearch(url) {
    this.currentRequest && this.currentRequest.abort();
    this.currentRequest = new AbortController();
    const { signal } = this.currentRequest;

    const headers = {
      "User-Agent": "podcastsuite",
      Accept: "application/json",
    };

    // Be defensive: some upstreams return non-JSON or empty bodies on error.
    return fetch(url, { headers, signal }).then(async (results) => {
      const text = await results.text();
      if (!results.ok || !text) return {};
      try {
        return JSON.parse(text);
      } catch {
        return {};
      }
    });
  }

  search(term) {
    this.currentRequest && this.currentRequest.abort();
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

  listennotes(term) {
    return this.querySearch(
      `${this.API}typeahead?q=${encodeURIComponent(term)}&show_podcasts=1`
    );
  }

  apple(term) {
    return this.querySearch(`/search/?term=${encodeURIComponent(term)}`);
  }
}
