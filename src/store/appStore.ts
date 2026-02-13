import { create } from "zustand";

import {
  completeEpisodeHistory,
  recordEpisode,
  completeEpisode,
  updateMediaSessionState,
  checkIfMediaSessionLodaded,
  getInitialState,
  defaultState,
} from "../reducer";
import { AppAction, AppState } from "../types/app";

interface AppStore {
  state: AppState;
  reset: () => void;
  dispatch: (action: AppAction) => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  state: getInitialState(),

  reset: () => set({ state: { ...defaultState } }),

  dispatch: (action) => {
    const current = get().state;

    switch (action.type) {
      case "updatePodcasts":
      case "initLibrary":
        return set({ state: { ...current, podcasts: action.podcasts } });

      case "loadPodcast":
        return set({ state: { ...current, current: action.payload } });

      case "setDark":
        return set({ state: { ...current, theme: action.payload } });

      case "playingStatus": {
        const { status } = action;
        updateMediaSessionState(status);
        checkIfMediaSessionLodaded(current);
        return set({ state: { ...current, status } });
      }

      case "updateCurrent":
        return set({ state: { ...current, current: action.payload } });

      case "addNext": {
        const playlist = [...(current.playlist || [])];
        playlist.unshift(action.payload);
        return set({ state: { ...current, playlist } });
      }

      case "addLast": {
        const playlist = [...(current.playlist || [])];
        playlist.push(action.payload);
        return set({ state: { ...current, playlist } });
      }

      case "audioCompleted": {
        const guid = current.episodeInfo && current.episodeInfo.guid;
        void completeEpisodeHistory(current.current, guid);
        const next = completeEpisode(current);
        return set({ state: next });
      }

      case "audioUpdate": {
        const payload = action.payload || {};
        updateMediaSessionState(payload.status as MediaSessionPlaybackState);

        if (payload.status === "paused") {
          try {
            recordEpisode(
              current.audioOrigin,
              current.episodeInfo && current.episodeInfo.guid,
              current.currentTime,
              current.duration
            );
          } catch (_) {
            // Ignore in non-browser/test contexts.
          }
          return set({ state: { ...current, ...payload, refresh: Date.now() } });
        }

        return set({ state: { ...current, ...payload } });
      }

      case "removeFromPlayList": {
        const playlist = [...(current.playlist || [])];
        playlist.splice(action.episode, 1);
        return set({ state: { ...current, playlist } });
      }

      case "clearPlayList":
        return set({ state: { ...current, playlist: [] } });

      case "resetState":
        return set({ state: { ...defaultState } });

      case "drawer": {
        const { status, drawerContent } = action.payload || {};
        if (!status) return set({ state: { ...current, drawer: false } });
        return set({ state: { ...current, drawer: true, drawerContent } });
      }

      default:
        return set({ state: current });
    }
  },
}));

export const appDispatch = (action: AppAction) => useAppStore.getState().dispatch(action);
export const getAppState = (): AppState => useAppStore.getState().state;
