import PodcastEngine from "podcastsuite";
import { podcasts } from "../podcast";
import { AppAction } from "../types/app";
import { fetchRSS } from "../platform/api";

const DEBUG = !process.env.NODE_ENV || process.env.NODE_ENV === "development";
const IS_DESKTOP = process.env.PLATFORM === "desktop";

const HOST = typeof window !== "undefined" && window.location ? window.location.host : "";

// In desktop mode we don't need a proxy — the bun process fetches directly.
// For web, RSS fetches go through the dev server proxy (or Netlify lambda in prod).
const PROXY = IS_DESKTOP
  ? null
  : {
      "https:": `//${HOST}/rss-full/?term=https://`,
      "http:": `//${HOST}/rss-full/?term=http://`,
    };

// Custom fetchEngine for desktop: routes RSS fetches through bun RPC.
const desktopFetchEngine = async (url: URL | string) => {
  const text = await fetchRSS(url.toString());
  return new Response(text, {
    status: 200,
    headers: {
      "content-type": "application/rss+xml",
      "content-length": String(new Blob([text]).size),
    },
  });
};

export const checkIfNewPodcastInURL = () => {
  const urlPodcast = typeof window !== "undefined" ? new window.URL(window.location.href) : null;
  const podcast = urlPodcast?.searchParams.get("podcast");
  const shouldInit = urlPodcast?.searchParams.get("init");
  return { podcast, shouldInit };
};

export const getPodcastEngine = (shouldInit = false) =>
  new (PodcastEngine as unknown as {
    new (config: Record<string, unknown>): unknown;
  })({
    podcasts: [...podcasts],
    proxy: PROXY,
    ...(IS_DESKTOP ? { fetchEngine: desktopFetchEngine } : {}),
    fresh: 1000 * 60 * 60,
    shouldInit,
  });

/*
 Start the application and loads the library.
*/
export const initializeLibrary = function (
  PodcastLibrary: {
    ready: Promise<void>;
    getLibrary: () => Promise<string[]>;
    getPodcast: (url: string) => Promise<Record<string, unknown>>;
  },
  dispatch: (action: AppAction) => void
) {
  PodcastLibrary.ready.then(() => {
    PodcastLibrary.getLibrary().then((podcastsArray) => {
      Promise.allSettled(podcastsArray.map((podcastRaw) => PodcastLibrary.getPodcast(podcastRaw)))
        .then((results) => results.filter((result) => result.status === "fulfilled"))
        .then((podcasts) =>
          podcasts.map((podcast) => (podcast as PromiseFulfilledResult<Record<string, unknown>>).value)
        )
        .then((podcasts) => {
          if (podcasts) {
            dispatch({ type: "initLibrary", podcasts: podcastCleaner(podcasts) });
          }
        });
    });
  });
};

const podcastCleaner = (podcasts: Record<string, any>[]) => {
  return podcasts.map((podcast) => {
    delete podcast["items"];
    delete podcast["description"];
    delete podcast["length"];
    return {
      ...podcast,
      domain: podcast.url,
    };
  });
};

/*
Load a new podcast into the application
!! IT DOES NOT SAVE IT IN MEMORY
*/
// export const loadaNewPodcast = function (cast, callback) {
//   retrievePodcast
//     .call(this, cast, false) // RetrievePodcast
//     .then(() => {
//       callback && callback();
//     });
// };

// Rules for URLS
// export const commonRules = (originalUrl) => {
//   let url = originalUrl;
//   url = url.indexOf("http:") > -1 ? url.replace("http:", "https:") : url;
//   url = url.search("http") < 0 ? "https://" + url : url;
//   url =
//     url.indexOf("feeds.feedburner") > -1 && url.indexOf("?format=xml") === -1
//       ? url + "?format=xml"
//       : url;
//   return url;
// };

/*
Removes a podcast from library and from the application state.
@string: URL with the podcast
*/
// export const removePodcastFromLibrary = (state,dispatch) =>
//   (domain) => {
//     const url = typeof domain === "string" ? domain : state.current;
//     PodcastEngine.db.del(url).then(() => {
//       const podcastsState = state.podcasts;
//       const podcasts = podcastsState.filter((podcast) => podcast.domain !== url);
//       dispatch({type:'updatePodcasts', podcasts})
//     });
//   };

/*
Receives a Podcast URL and Loads into the View.
@string: URL with the podcast
*/
// export const fetchPodcastToView = function (podcast) {
//   return new Promise((acc) => {
//     PodcastLibrary.getPodcast(commonRules(podcast))
//       .then((cast) => {
//         if (cast) {
//           let { title, image, description, url, created, link } = cast;
//           this.setState({
//             title,
//             image,
//             description,
//             domain: url,
//             podcast,
//             created,
//             link
//           });
//         }
//         retrievePodcast.call(this, podcast);
//         acc(cast);
//       })
//       .catch((error) => console.error);
//   });
// };

/*
Receives an Event from the view and gets the URL.
@event from object with attribute to get URL
@string attribute to get the URL, default domain.
*/
// export const loadPodcastToView = function (ev, attribute = "domain") {
//   const podcast =
//     ev && ev.currentTarget && ev.currentTarget.getAttribute(attribute);
//   return fetchPodcastToView.call(this, podcast);
// };

/*
Save Current Podcast into Database and notify State of new add.
*/
// export const saveToLibrary = function () {
//   const cu = current.get();
//   retrievePodcast.call(this, cu.url, true);
// };
