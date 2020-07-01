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
          );
        });
      });
}

self.onmessage = (raw) => {
  const {data} = raw;
  switch (data.action) {
    case "update":
        updateLibrary();
        break;
    default:
        break;
  }
};
