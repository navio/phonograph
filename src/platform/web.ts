import serviceWorker from "../serviceworker";
import type { PlatformAdapter } from "./types";

const isAbsoluteUrl = (value: string) => /^https?:\/\//i.test(value);

const withLeadingSlash = (path: string) => (path.startsWith("/") ? path : `/${path}`);

const resolveWithCurrentOrigin = (path: string) => {
  if (isAbsoluteUrl(path) || typeof window === "undefined" || !window.location) {
    return path;
  }

  return `${window.location.origin}${withLeadingSlash(path)}`;
};

const webAdapter: PlatformAdapter = {
  runtime: "web",
  isDesktop: false,
  registerServiceWorker: () => {
    serviceWorker();
  },
  resolveBackendUrl: (path: string) => path,
  resolveShareUrl: resolveWithCurrentOrigin,
};

export default webAdapter;
