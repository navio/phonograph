export const STORAGEID = "library" as const;
export const ROOT = "/" as const;
export const LIBVIEW = "/library" as const;
export const PODCASTVIEW = "/podcast" as const;
export const DISCOVERVIEW = "/discover" as const;
export const SETTINGSVIEW = "/settings" as const;
export const PLAYLIST = "/playlist" as const;

export type RoutePath =
  | typeof ROOT
  | typeof LIBVIEW
  | typeof PODCASTVIEW
  | typeof DISCOVERVIEW
  | typeof SETTINGSVIEW
  | typeof PLAYLIST;
