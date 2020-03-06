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
      fetch(`${this.API}/search?search_term=${term}`, { signal })
        .then(result => result.ok && result.json().then(accept).catch(reject) || reject(result))
        .catch(reject))
  };

  listennotes(term) {
    this.currentRequest && this.currentRequest.abort();
    this.currentRequest = new AbortController();
    let { signal } = this.currentRequest;
    const api = `https://listen-api.listennotes.com/api/v2/search?q=${term}&sort_by_date=0&type=podcasts&offset=0&len_min=10&len_max=30&only_in=title&safe_mode=1`;
    const headers = {
      'X-ListenAPI-Key': '5b7650d15f5b4edea86257fe42791e22',
      'User-Agent': 'podcastsuite',
      'Accept': 'application/rss+xml'
    }
    const response = fetch(api, { headers, signal }).then(results => results.json());
    return response;
  };

  static getFinalURL(url) {
    const method = "HEAD";
    fetch(domain, {method})
    .then(response => response.he)
  }
}