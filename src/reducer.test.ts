import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { reducer, completeEpisode, defaultState } from "./reducer";
import { AppState, PlaylistItem } from "./types/app";

// Mock PodcastSuite
vi.mock("podcastsuite", () => ({
  default: {
    createDatabase: () => ({
      get: vi.fn(async () => ({})),
      set: vi.fn(async () => {}),
    }),
  },
}));

// Mock window.player
const mockPlayer = {
  src: "",
  currentTime: 0,
};

beforeEach(() => {
  vi.stubGlobal("window", {
    player: mockPlayer,
  });
  vi.stubGlobal("navigator", {
    mediaSession: {
      playbackState: "none",
      metadata: null,
      setActionHandler: vi.fn(),
    },
  });
  vi.stubGlobal("MediaMetadata", vi.fn());
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("reducer", () => {
  it("should return default state", () => {
    const state = reducer(undefined as any, {} as any);
    // When state is undefined, reducer might fail if not handled, but here we pass initial state usually.
    // The reducer definition is (state, action) => ...
    // If we pass undefined, it should probably return undefined or throw if not defaulted.
    // But let's test valid transitions.
    const result = reducer(defaultState, { type: "unknown" } as any);
    expect(result).toEqual(defaultState);
  });

  it("should handle updatePodcasts", () => {
    const podcasts = [{ feed: "rss", title: "Test" }];
    const newState = reducer(defaultState, { type: "updatePodcasts", podcasts });
    expect(newState.podcasts).toEqual(podcasts);
  });

  it("should handle loadPodcast", () => {
    const newState = reducer(defaultState, { type: "loadPodcast", payload: "test-rss" });
    expect(newState.current).toBe("test-rss");
  });

  it("should handle setDark", () => {
    const newState = reducer(defaultState, { type: "setDark", payload: "dark" });
    expect(newState.theme).toBe("dark");
  });

  it("should handle playingStatus", () => {
    const newState = reducer(defaultState, { type: "playingStatus", status: "playing" });
    expect(newState.status).toBe("playing");
    expect(navigator.mediaSession.playbackState).toBe("playing");
  });

  it("should handle addNext", () => {
    const item: PlaylistItem = { media: "url", title: "Episode" };
    const newState = reducer(defaultState, { type: "addNext", payload: item });
    expect(newState.playlist).toHaveLength(1);
    expect(newState.playlist[0]).toEqual(item);
  });

  it("should handle removeFromPlayList", () => {
    const startState = {
      ...defaultState,
      playlist: [{ media: "1" }, { media: "2" }],
    } as AppState;
    const newState = reducer(startState, { type: "removeFromPlayList", episode: 0 });
    expect(newState.playlist).toHaveLength(1);
    expect(newState.playlist[0].media).toBe("2");
  });
});

describe("completeEpisode", () => {
  it("should play next episode if playlist has items", () => {
    const startState: AppState = {
      ...defaultState,
      playlist: [
        { media: "next.mp3", currentTime: 10, title: "Next" },
        { media: "future.mp3" },
      ] as PlaylistItem[],
    };

    const newState = completeEpisode(startState);

    expect(newState.media).toBe("next.mp3");
    expect(mockPlayer.src).toBe("next.mp3");
    expect(mockPlayer.currentTime).toBe(10);
    expect(newState.playlist).toHaveLength(1);
    expect(newState.playlist[0].media).toBe("future.mp3");
  });

  it("should clear state if playlist is empty", () => {
    const startState: AppState = {
      ...defaultState,
      playlist: [],
      media: "done.mp3",
      playing: "guid",
    };

    const newState = completeEpisode(startState);

    expect(newState.media).toBe("");
    expect(newState.playing).toBeNull();
    expect(newState.status).toBeNull();
  });
});
