import PS from "podcastsuite";
import { AppAction, AppState, PlaylistItem } from "./types/app";

const db = PS.createDatabase("history", "podcasts");

export const completeEpisodeHistory = async (
  feed: string | null,
  episode: string | undefined,
  fb?: () => void
): Promise<boolean> => {
  if (feed && episode) {
    const inMemory = await db.get(feed);
    const current = (inMemory as Record<string, unknown>) || {};
    current[episode] = { completed: true };
    await db.set(feed, current);
    if (fb) {
      fb();
    }
    return true;
  }
  return false;
};

export const completeEpisode = (state: AppState): AppState => {
  const { playlist } = state;
  const { player } = window;
  if (playlist && playlist.length > 0) {
    const nextEpisode = playlist.shift() as PlaylistItem;
    player.src = nextEpisode.media;
    player.currentTime = nextEpisode.currentTime || 0;

    return { ...state, ...nextEpisode, playlist, refresh: Date.now() };
  }

  const cleanPayload: Partial<AppState> = {
    episode: null,
    playing: null,
    status: null,
    episodeInfo: null,
    podcastImage: null,
    audioOrigin: "",
    media: "",
    played: 0,
    currentTime: null,
    refresh: Date.now(),
  };

  return {
    ...state,
    ...cleanPayload,
  };
};

export const recordEpisode = async (
  feed: string | null | undefined,
  episode: string | undefined,
  currentTime?: number | null,
  duration?: number
): Promise<void> => {
  if (!feed || !episode) return;
  const inMemory = await db.get(feed);
  const current = (inMemory as Record<string, unknown>) || {};
  current[episode] = { completed: false, currentTime, duration };
  await db.set(feed, current);
};

export const updateMediaSessionState = (
  value: MediaSessionPlaybackState | undefined
) => {
  if (typeof navigator !== "undefined" && "mediaSession" in navigator && value) {
    navigator.mediaSession.playbackState = value;
  }
};

export const checkIfMediaSessionLodaded = (state: AppState) => {
  if (
    typeof navigator !== "undefined" &&
    "mediaSession" in navigator &&
    navigator.mediaSession.metadata === null &&
    state.episodeInfo
  ) {
    const { episodeInfo, podcastAuthor, podcastImage, title } = state;
    const { title: episodeTitle } = episodeInfo;

    if (typeof MediaMetadata === "undefined") return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: episodeTitle,
      artist: podcastAuthor || "",
      album: title,
      artwork: podcastImage
        ? [
            { src: podcastImage, sizes: "96x96", type: "image/png" },
            { src: podcastImage, sizes: "128x128", type: "image/png" },
            { src: podcastImage, sizes: "192x192", type: "image/png" },
            { src: podcastImage, sizes: "256x256", type: "image/png" },
            { src: podcastImage, sizes: "384x384", type: "image/png" },
            { src: podcastImage, sizes: "512x512", type: "image/png" },
          ]
        : [],
    });
  }
};

export const defaultState: AppState = {
  podcasts: [],
  theme: true,
  current: null,

  status: null,
  playing: null,
  loaded: 0,
  played: 0,
  audioOrigin: "",
  loading: false,

  title: "",
  image: null,
  episode: null,
  episodeInfo: null,

  playlist: [],

  currentTime: null,
  media: "",
  refresh: Date.now(),
};

const safeReadLocalStorage = (key: string): string | null => {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

export const getInitialState = (): AppState => {
  const raw = safeReadLocalStorage("state");
  let state: AppState = { ...defaultState };
  if (raw) {
    try {
      state = (JSON.parse(raw) as AppState) || defaultState;
    } catch {
      state = { ...defaultState };
    }
  }

  const cleaned: AppState = { ...state };
  delete (cleaned as Record<string, unknown>)["items"];
  delete (cleaned as Record<string, unknown>)["description"];
  delete (cleaned as Record<string, unknown>)["image"];
  delete (cleaned as Record<string, unknown>)["link"];
  delete (cleaned as Record<string, unknown>)["created"];

  cleaned.status = cleaned.status || "paused";

  return cleaned;
};

export const initialState: AppState = getInitialState();

export const reducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case "updatePodcasts":
    case "initLibrary":
      return { ...state, podcasts: action.podcasts };
    case "loadPodcast":
      return { ...state, current: action.payload };
    case "setDark":
      return { ...state, theme: action.payload };
    case "playingStatus": {
      const { status } = action;
      updateMediaSessionState(status);
      checkIfMediaSessionLodaded(state);
      return { ...state, status };
    }
    case "updateCurrent":
      return { ...state, current: action.payload };
    case "addNext": {
      const playlist = [...(state.playlist || [])];
      playlist.unshift(action.payload);
      return { ...state, playlist };
    }
    case "addLast": {
      const playlist = [...(state.playlist || [])];
      playlist.push(action.payload);
      return { ...state, playlist };
    }
    case "audioCompleted": {
      const guid = state.episodeInfo && state.episodeInfo.guid;
      void completeEpisodeHistory(state.current, guid);
      return completeEpisode(state);
    }
    case "audioUpdate": {
      updateMediaSessionState(action.payload.status as MediaSessionPlaybackState);
      if (action.payload && action.payload.status === "paused") {
        const guid = state.episodeInfo && state.episodeInfo.guid;
        void recordEpisode(state.audioOrigin, guid, state.currentTime, state.duration);
        return { ...state, ...action.payload, refresh: Date.now() };
      }
      return { ...state, ...action.payload };
    }
    case "removeFromPlayList": {
      const playlist = [...(state.playlist || [])];
      playlist.splice(action.episode, 1);
      return { ...state, playlist };
    }
    case "clearPlayList":
      return { ...state, playlist: [] };
    case "resetState":
      return { ...defaultState };
    case "drawer": {
      const { status, drawerContent } = action.payload || {};
      if (!status) {
        return { ...state, drawer: false };
      }
      return { ...state, drawer: true, drawerContent };
    }
    default:
      return state;
  }
};
