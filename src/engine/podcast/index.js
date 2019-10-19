import { defaultCasts } from "../../podcast/podcast";

import PodcastSearcher from "./PodcastSearcher";
import randomColor from "randomcolor";
import PodcastEngine from "podcastsuite";

import Podcast from "./Podcast";

const DEBUG = !process.env.NODE_ENV || process.env.NODE_ENV === "development";

const API = !DEBUG
  ? "/podcasts/"
  : "https://cors-anywhere.herokuapp.com/https://feedwrangler.net/api/v2/podcasts/";

const PROXY = !DEBUG
  ? {
      "https:": "/rss-pg/",
      "http:": "/rss-less-pg/"
    }
  : {
      "https:": "https://cors-anywhere.herokuapp.com/",
      "http:": "https://cors-anywhere.herokuapp.com/"
    };

const nprRule = (url) => (url.indexOf('npr') > -1) ? url.replace('http:', 'https:'):url;

const initializeCast = defaultCasts.map(nprRule);

const PodcastLibrary = new PodcastEngine({
  podcasts: initializeCast,
  proxy: PROXY
});
const current = new Podcast();

export const loadEpisodesToMemory = function(RSS) {
  RSS.forEach(item => this.episodes.set(item.guid, item));
};

export const removePodcastFromState = function() {
  this.setState({
    items: null,
    title: "",
    image: null,
    link: null,
    description: "",
    podcast: null
  });
  this.episodes.clear();
};

export const removePodcastFromLibrary = function(domain) {
  const url = domain || current.get().url;
  PodcastEngine.db.del(url).then(() => {
    let podcastsState = this.state.podcasts;
    let podcasts = podcastsState.filter(podcast => podcast.domain !== url);
    this.setState({
      podcasts
    });
  });
};

export const loadPodcastToView = function(ev) {
  let podcast =
    ev && ev.currentTarget && ev.currentTarget.getAttribute("domain");
  return new Promise(acc => {
    PodcastLibrary.getPodcast(nprRule(podcast))
      // DB.get(podcast)
      .then(cast => {
        if (cast) {
          let { title, image, description, url } = cast;
          this.setState({
            title,
            image,
            description,
            domain: url,
            podcast
          });
        }
        retrievePodcast.call(this, podcast);
        acc(cast);
      });
  });
};

export const saveToLibrary = function() {
  const cu = current.get();
  const podcasts = this.state.podcasts;
  PodcastLibrary.getPodcast(cu.url).then(inMemory => {
    this.setState(
      {
        title: inMemory.title,
        image: inMemory.image,
        link: inMemory.link,
        description: inMemory.description,
        domain: inMemory.url,
        items: inMemory.items.slice(0, 20),
        podcasts: [{ ...inMemory, domain: inMemory.url }, ...podcasts]
      },
      () => loadEpisodesToMemory.call(this, inMemory.items)
    );
  });
};

export const retrievePodcast = function(castArg, save = false) {
  const cast = nprRule(castArg);
  current.clear();
  return new Promise(accept => {
    PodcastLibrary.getPodcast(cast, { save }).then(castContent => {
      let newState = {
        items: castContent.items.slice(0, 20),
        title: castContent.title,
        description: castContent.description,
        image: castContent.image,
        link: castContent.url,
        lastUpdated: Date.now(),
        domain: cast
      };
      current.set(castContent);
      this.setState(newState, () => {
        loadEpisodesToMemory.call(this, castContent.items.slice(0, 20));
        accept({ ...castContent, ...cast });
      });
    });
  });
};

export const isPodcastInLibrary = function() {
  return this.state.podcasts.find(cast => cast.domain === this.state.domain);
};

export const initializeLibrary = function() {
  PodcastLibrary.getLibrary().then(podcastsArray => {
    const podcastsData = Promise.all(
      podcastsArray.map(podcastRaw => PodcastLibrary.getPodcast(podcastRaw))
    );
    podcastsData.then(podcasts => {
      if (podcasts) {
        const updatePodcasts = podcasts.map(podcast => ({
          ...podcast,
          domain: podcast.url
        }));
        this.setState({
          podcasts: updatePodcasts
        });
      }
    });
  });
};

export const addNewPodcast = function(newPodcast, callback) {
  const cast = `${newPodcast.protocol}//${newPodcast.domain}`;
  retrievePodcast
    .call(this, cast, true) // RetrievePodcast
    .then(() => {
      callback && callback();
    });
};

/** LOCAL LIBRARY END */

/********* UTILS START *********/

export const clearDomain = (domain) => domain.replace(/(^\w+:|^)\/\//, '');

export const convertURLToPodcast = url => {
  // Todo: try https, then http otherwise fail.
  if (!url) return null;
  let fixURL = url.search("http") < 0 ? `https://${url}` : url;
  try {
    let podcast = new URL(fixURL);
    let domain = clearDomain(podcast.href);
    let protocol = podcast.protocol;
    return {
      domain,
      protocol
    };
  } catch (error) {
    return null;
  }
};

export const driveThruDNS = url => {
  let r = convertURLToPodcast(url);
  return DEBUG ? url : `${PROXY[r.protocol]}${r.domain}`;
};

export const checkIfNewPodcastInURL = function() {
  if (!window && !window.location)
    return {
      domain: "www.npr.org/rss/podcast.php?id=510289",
      protocol: "https:"
    };
  let urlPodcast = new window.URL(window.location.href);
  let podcast = urlPodcast.searchParams.get("podcast");

  return convertURLToPodcast(podcast);
};

export const getPopularPodcasts = function() {
  return new Promise(function(acc, rej) {
    fetchJ(`${API}/popular`)
      .then(data => acc(data.podcasts))
      .catch(err => rej(err));
  });
};

export const getPodcastColor = cast => ({
  backgroundColor: randomColor({
    seed: cast.title,
    luminosity: "dark",
    hue: "blue"
  })
});

/********* UTILS END *********/

// SEARCH!!!
const SFP = new PodcastSearcher(API);
export const searchForPodcasts = function(search) {
  return new Promise(function(acc, rej) {
    SFP.search(search)
      .then(data => acc(data.podcasts))
      .catch(console.error);
  });
};

//Events
// Ask for podcast URL.
export const askForPodcast = function(callback) {
  let input = prompt("URL or Name of Podcast");
  if (!input) return;
  input = input.trim();
  try {
    new URL(input) &&
      addNewPodcast.call(this, convertURLToPodcast(input), callback);
  } catch (err) {
    // Maybe search the string?
    console.log("error", err);
  }
};
