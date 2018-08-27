export default class PodcastSearcher {
  constructor(API){
    let currentRequest = null;
    this.API = API;
  }
  search(term){
    this.currentRequest && this.currentRequest.abort();
    this.currentRequest = new AbortController();
    let {signal} = this.currentRequest;
    return new Promise((accept,reject) => 
                        fetch(`${this.API}/search?search_term=${term}`,{signal})
                        .then(result => result.ok && result.json().then(accept).catch(reject) || reject(result))
                        .catch(reject))
  }
}