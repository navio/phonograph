import { fetchListenNotes, searchApple } from "../../platform/api";

export interface PodcastSearchResponse {
  results?: Array<Record<string, any>>;
  [key: string]: any;
}

export default class PodcastSearcher {
  search(term: string): Promise<PodcastSearchResponse> {
    return fetchListenNotes("search", {
      type: "podcast",
      q: term,
    });
  }

  listennotes(term: string): Promise<PodcastSearchResponse> {
    return fetchListenNotes("typeahead", {
      q: term,
      show_podcasts: "1",
    });
  }

  apple(term: string): Promise<PodcastSearchResponse> {
    return searchApple(term);
  }
}
