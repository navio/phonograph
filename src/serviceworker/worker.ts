import PodcastEngine from "podcastsuite";

const DEBUG = !process.env.NODE_ENV || process.env.NODE_ENV === "development";

const DEFAULT_DESKTOP_API_ORIGIN = "https://phonograph.app";

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const withLeadingSlash = (path: string) => (path.startsWith("/") ? path : `/${path}`);

const isAbsoluteUrl = (value: string) => /^https?:\/\//i.test(value);

const resolveDesktopBackendOrigin = () => {
  const configuredOrigin = import.meta.env.VITE_DESKTOP_API_ORIGIN;
  if (configuredOrigin && configuredOrigin.trim()) {
    return trimTrailingSlash(configuredOrigin.trim());
  }

  return DEFAULT_DESKTOP_API_ORIGIN;
};

const resolveBackendUrl = (path: string) => {
  if (isAbsoluteUrl(path)) {
    return path;
  }

  const normalizedPath = withLeadingSlash(path);
  if (location.protocol === "tauri:") {
    return `${resolveDesktopBackendOrigin()}${normalizedPath}`;
  }

  return `//${location.host}${normalizedPath}`;
};

const proxy = DEBUG
  ? {
      "https:": resolveBackendUrl("/rss-full/?term=https://"),
      "http:": resolveBackendUrl("/rss-full/?term=http://"),
    }
  : {
      "https:": resolveBackendUrl("/rss-full/https://"),
      "http:": resolveBackendUrl("/rss-full/http://"),
    };

const getPodcastEngine = (shouldInit = false) =>
  new (PodcastEngine as any)({
    podcasts: [],
    fresh: 1000 * 60 * 60,
    shouldInit,
    proxy,
  });

const podcastEngine = getPodcastEngine(false);

const updateLibrary = () => {
  podcastEngine.ready.then(() => {
    podcastEngine.getLibrary().then((podcastsArray: string[]) => {
      Promise.allSettled(podcastsArray.map((podcastRaw: string) => podcastEngine.getPodcast(podcastRaw)));
    });
  });
};

self.onmessage = (raw: MessageEvent<{ action: string }>) => {
  const { data } = raw;
  switch (data.action) {
    case "update":
      updateLibrary();
      break;
    default:
      break;
  }
};

export {};
