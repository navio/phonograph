import { create } from "zustand";

// Keep these helpers in reducer.js (existing module) but make them safe for non-browser contexts.
import {
  completeEpisodeHistory,
  recordEpisode,
  completeEpisode,
  updateMediaSessionState,
  checkIfMediaSessionLodaded,
  getInitialState,
  defaultState,
} from "../reducer";

/**
 * Zustand store wrapper.
 *
 * We keep a Redux-ish `dispatch({type,...})` interface so the rest of the app
 * can remain functionally identical during migration.
 */
export const useAppStore = create((set, get) => ({
  state: getInitialState(),

  // Convenience for tests / emergency resets.
  reset: () => set({ state: { ...defaultState } }),

  dispatch: (action = {}) => {
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
        completeEpisodeHistory(current.current, guid);
        const next = completeEpisode(current);
        return set({ state: next });
      }

      case "audioUpdate": {
        const payload = action.payload || {};
        updateMediaSessionState(payload.status);

        if (payload.status === "paused") {
          // Record progress when pausing.
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
        const { status, drawerContent } = (action.payload || {});
        if (!status) return set({ state: { ...current, drawer: false } });
        return set({ state: { ...current, drawer: true, drawerContent } });
      }

      default:
        return;
    }
  },
}));

export const appDispatch = (action) => useAppStore.getState().dispatch(action);
export const getAppState = () => useAppStore.getState().state;
