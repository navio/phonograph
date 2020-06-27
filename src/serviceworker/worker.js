import PodcastEngine from "podcastsuite";

const DEBUG = !process.env.NODE_ENV || process.env.NODE_ENV === "development";

const proxy = DEBUG
  ? {
      "https:": `//${location.host}/rss-full/?term=https://`,
      "http:": `//${location.host}/rss-full/?term=http://`,
    }
  : {
      "https:": `//${location.host}/rss-full/https://`,
      "http:": `//${location.host}/rss-full/http://`,
    };

const getPodcastEngine = (shouldInit = false) =>
  new PodcastEngine({
    podcasts: [],
    fresh: 1000 * 60 * 60,
    shouldInit,
    proxy,
  });

const podcastEngine = getPodcastEngine(false);

const updateLibrary = () => {
    console.log('updating');
    podcastEngine.ready.then(() => {
        podcastEngine.getLibrary().then((podcastsArray) => {
          Promise.allSettled(
            podcastsArray.map((podcastRaw) => podcastEngine.getPodcast(podcastRaw))
          )
        //   .then((results) =>  results.filter((result) => result.status === 'fulfilled'))
        //   .then((podcasts) => podcasts.map(podcast => podcast.value))
        //   .then((podcasts) => {
        //     if (podcasts) {
        //       dispatch({type: 'initLibrary', podcasts: podcastCleaner(podcasts)})
        //     }
        //   });
        });
      });
}

self.onmessage = (raw) => {
  console.log('a',raw);
  const {data} = raw;
  switch (data.action) {
    case "update":
        updateLibrary();
        break;
    default:
        break;
  }
};
