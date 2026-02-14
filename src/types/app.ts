// Core application types

export interface EpisodeInfo {
  title: string;
  guid: string;
  author?: string;
  subtitle?: string;
  description?: string;
  pubDate?: string;
  duration?: number;
  media?: string;
  currentTime?: number;
  [key: string]: unknown;
}

export interface PodcastEntry {
  feed?: string;
  domain?: string;
  url?: string;
  title?: string;
  image?: string;
  author?: string;
  created?: number;
  [key: string]: unknown;
}

export interface PlaylistItem {
  media: string;
  currentTime?: number;
  episode?: string;
  episodeInfo?: EpisodeInfo;
  podcastImage?: string;
  title?: string;
  author?: string;
  audioOrigin?: string;
  [key: string]: unknown;
}

export interface AppState {
  podcasts: PodcastEntry[];
  theme: boolean | "dark" | "light" | "os";
  current: string | null;

  status: "playing" | "paused" | null;
  playing: string | null;
  loaded: number;
  played: number;
  audioOrigin: string;
  loading: boolean;

  title: string;
  image: string | null;
  episode: string | null;
  episodeInfo: EpisodeInfo | null;

  playlist: PlaylistItem[];

  currentTime: number | null;
  duration?: number;
  media: string;
  refresh: number;

  drawer?: boolean;
  drawerContent?: unknown;
  podcastImage?: string;
  podcastAuthor?: string;
  [key: string]: unknown;
}

export type AppAction =
  | { type: "updatePodcasts"; podcasts: PodcastEntry[] }
  | { type: "initLibrary"; podcasts: PodcastEntry[] }
  | { type: "loadPodcast"; payload: string }
  | { type: "setDark"; payload: boolean | "dark" | "light" | "os" }
  | { type: "playingStatus"; status: "playing" | "paused" }
  | { type: "updateCurrent"; payload: string }
  | { type: "addNext"; payload: PlaylistItem }
  | { type: "addLast"; payload: PlaylistItem }
  | { type: "audioCompleted" }
  | { type: "audioUpdate"; payload: Partial<AppState> }
  | { type: "removeFromPlayList"; episode: number }
  | { type: "clearPlayList" }
  | { type: "resetState" }
  | { type: "drawer"; payload?: { status: boolean; drawerContent?: unknown } };

export interface AppContextValue {
  state: AppState;
  dispatch: (action: AppAction) => void;
  engine: unknown;
  debug: boolean;
  worker: Worker;
  player: HTMLAudioElement | null;
  playerRef: React.RefObject<HTMLAudioElement | null>;
}

export interface PlayerFunctions {
  playButton: () => void;
  rewind10Seconds: () => void;
  forward30Seconds: () => void;
  seek: (event: Event, value: number | number[]) => void;
}
