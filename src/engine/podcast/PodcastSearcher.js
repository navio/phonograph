export default class PodcastSearcher {
  constructor(API) {
    let currentRequest = null;
    this.API = API;
  }
  search(term) {
    this.currentRequest && this.currentRequest.abort();
    this.currentRequest = new AbortController();
    let { signal } = this.currentRequest;
    return new Promise((accept, reject) =>
      fetch(`${this.API}search?type=podcast&q=${term}`, { signal })
        .then(
          (result) =>
            (result.ok && result.json().then(accept).catch(reject)) ||
            reject(result)
        )
        .catch(reject)
    );
  }

  listennotes(term) {
    this.currentRequest && this.currentRequest.abort();
    this.currentRequest = new AbortController();
    let { signal } = this.currentRequest;
    const api = `${this.API}typeahead?q=${term}&show_podcasts=1`;
    const headers = {
      'User-Agent': 'podcastsuite',
      'Accept': 'application/json',
    }
    const response = fetch(api, { headers, signal }).then(results => results.json());
    return response;
  }

  static getFinalURL(url) {
    const method = "HEAD";
    fetch(domain, { method }).then((response) => response.he);
  }
}
