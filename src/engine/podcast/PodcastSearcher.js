export default class PodcastSearcher {
  constructor(){
    let currentRequest = null;
  }
  search(term){
    this.currentRequest && this.currentRequest.abort();
    this.currentRequest = new AbortController();
    let {signal} = this.currentRequest;
    return new Promise((accept,reject) => 
                        fetch(`${API}/search?search_term=${term}`,{signal})
                        .then(result => result.ok && result.json().then(accept).catch(reject) || reject(result))
                        .catch(reject))
  }
}