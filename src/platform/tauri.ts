import type { PlatformAdapter } from "./types";

const DEFAULT_PUBLIC_WEB_ORIGIN = "https://phonograph.app";

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const isAbsoluteUrl = (value: string) => /^https?:\/\//i.test(value);

const withLeadingSlash = (path: string) => (path.startsWith("/") ? path : `/${path}`);

const resolveDesktopBackendOrigin = () => {
  const configuredOrigin = import.meta.env.VITE_DESKTOP_API_ORIGIN;
  if (configuredOrigin && configuredOrigin.trim()) {
    return trimTrailingSlash(configuredOrigin.trim());
  }

  if (import.meta.env.DEV && typeof window !== "undefined" && window.location?.origin) {
    return trimTrailingSlash(window.location.origin);
  }

  return DEFAULT_PUBLIC_WEB_ORIGIN;
};

const resolvePublicWebOrigin = () => {
  const configuredOrigin = import.meta.env.VITE_PUBLIC_WEB_ORIGIN;
  if (configuredOrigin && configuredOrigin.trim()) {
    return trimTrailingSlash(configuredOrigin.trim());
  }

  return DEFAULT_PUBLIC_WEB_ORIGIN;
};

const toAbsoluteUrl = (origin: string, path: string) => {
  if (isAbsoluteUrl(path)) {
    return path;
  }
  return `${trimTrailingSlash(origin)}${withLeadingSlash(path)}`;
};

const tauriAdapter: PlatformAdapter = {
  runtime: "tauri",
  isDesktop: true,
  registerServiceWorker: () => {},
  resolveBackendUrl: (path: string) => toAbsoluteUrl(resolveDesktopBackendOrigin(), path),
  resolveShareUrl: (path: string) => toAbsoluteUrl(resolvePublicWebOrigin(), path),
};

export default tauriAdapter;
