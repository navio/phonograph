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

// Rules for URLS
export const commonRules = (originalUrl) => {
  let url = originalUrl;
  url = ( url.indexOf('http:') > -1 ) ? url.replace('http:', 'https:'): url;
  url = ( url.search("http") < 0 ) ? "https://" + url : url;
  url = ( ( url.indexOf('feeds.feedburner') > -1 ) && (url.indexOf('?format=xml') === -1 ) ) ?
        url + "?format=xml" : url;
  return url
}

const initializeCast = defaultCasts.map(commonRules);

const PodcastLibrary = new PodcastEngine({
  podcasts: initializeCast,
  proxy: PROXY
});
const current = new Podcast();




// export const removePodcastFromState = function() {
//   this.setState({
//     items: null,
//     title: "",
//     image: null,
//     link: null,
//     description: "",
//     podcast: null
//   });
//   this.episodes.clear();
// };

/*
Removes a podcast from library and from the application state.
@string: URL with the podcast
*/
export const removePodcastFromLibrary = function(domain) {
  const url = (typeof domain === "string") ?
       domain : 
       current.get().url;
  PodcastEngine.db.del(url).then(() => {
    let podcastsState = this.state.podcasts;
    let podcasts = podcastsState.filter(podcast => podcast.domain !== url);
    this.setState({
      podcasts
    });
  });
};

/*
Receives a Podcast URL and Loads into the View.
@string: URL with the podcast
*/
export const fetchPodcastToView = function(podcast) {
  return new Promise(acc => {
    PodcastLibrary.getPodcast(commonRules(podcast))
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

/*
Receives an Event from the view and gets the URL.
@event from object with attribute to get URL
@string attribute to get the URL, default domain.
*/
export const loadPodcastToView = function(ev, attribute = "domain") {
  const podcast = ev &&
                  ev.currentTarget &&
                  ev.currentTarget.getAttribute(attribute);
  return fetchPodcastToView.call(this, podcast);
};

/*
Save Current Podcast into Database and notify State of new add.
*/
export const saveToLibrary = function() {
  const cu = current.get();
  retrievePodcast.call(this,cu.url,true);
};

/*
Receives an array of episodes from a podcast and load them into episodes object.
@string: URL with the podcast
*/
export const loadEpisodesToInAppMemory = function(RSS) {
  // To Fix, remove old episodes.
  RSS.forEach(item => this.episodes.set(item.guid, item));
};

/*
Retrieves all Podcast content, if save
@string of podcast
@boolean if to save or not the podcast
*/
export const retrievePodcast = function(castArg, save = false) {
  const cast = commonRules(castArg);
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
      if(save){
        const podcasts = this.state.podcasts;
        newState.podcasts = [{ ...castContent, domain: castContent.url }, ...podcasts]
      }
      current.set(castContent);
      this.setState(newState, () => {
        loadEpisodesToInAppMemory.call(this, castContent.items.slice(0, 20));
        accept({ ...castContent, ...cast});
      });
    });
  });
};

/*
 Verifies if visible podcast is in library by checking.
*/
export const isPodcastInLibrary = function() {
  return this.state.podcasts.find(cast => cast.domain === this.state.domain);
};

/*
 Start the application and loads the library.
*/
export const initializeLibrary = function() {
  PodcastLibrary.ready.then( () => {
    PodcastLibrary.getLibrary().then(podcastsArray => {
      Promise.all(
        podcastsArray.map(podcastRaw => PodcastLibrary.getPodcast(podcastRaw))
      ).then(podcasts => {
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
  });
};

/*
Load a new podcast into the application
!! IT DOES NOT SAVE IT IN MEMORY
*/
export const loadaNewPodcast = function(cast, callback) {
  retrievePodcast
    .call(this, cast, false) // RetrievePodcast
    .then(() => {
      callback && callback();
    });
};

/** LOCAL LIBRARY END */

/********* UTILS START *********/

// export const convertURLToPodcast = url => {
//   // Todo: try https, then http otherwise fail.
//   const clearDomain = (domain) => domain.replace(/(^\w+:|^)\/\//, '');

//   if (!url) return null;
//   let fixURL = url.search("http") < 0 ? `https://${url}` : url;
//   try {
//     let podcast = new URL(fixURL);
//     let domain = clearDomain(podcast.href);
//     let protocol = podcast.protocol;
//     return {
//       domain,
//       protocol
//     };
//   } catch (error) {
//     return null;
//   }
// };

export const driveThruDNS = url => {
  const urlObj = new URL(url);
  const domain = urlObj.href.replace(urlObj.protocol, '').slice(2);
  const protocol = urlObj.protocol;
  return DEBUG ? urlObj.toString() : `${PROXY[protocol]}${domain}`;
};

export const checkIfNewPodcastInURL = function() {
  if (!window && !window.location)
    return {
      domain: "www.npr.org/rss/podcast.php?id=510289",
      protocol: "https:"
    };
  let urlPodcast = new window.URL(window.location.href);
  let podcast = urlPodcast.searchParams.get("podcast");
  return podcast;
};

// export const getPopularPodcasts = function() {
//   return new Promise(function(acc, rej) {
//     fetchJ(`${API}/popular`)
//       .then(data => acc(data.podcasts))
//       .catch(err => rej(err));
//   });
// };

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
    SFP.listennotes(search)
      .then(data => acc(data.results))
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
