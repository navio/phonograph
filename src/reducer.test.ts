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
const mockPlayer: Record<string, any> = {
  src: "",
  currentTime: 0,
  playbackRate: 1.0,
};

const store: Record<string, string> = {};

beforeEach(() => {
  mockPlayer.src = "";
  mockPlayer.currentTime = 0;
  mockPlayer.playbackRate = 1.0;
  Object.keys(store).forEach((k) => delete store[k]);

  vi.stubGlobal("window", {
    player: mockPlayer,
    localStorage: {
      getItem: vi.fn((key: string) => store[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key: string) => delete store[key]),
    },
  });
  vi.stubGlobal("localStorage", (window as any).localStorage);
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

  it("should apply skip intro when next episode has no saved position and settings exist", () => {
    store["podcastSettings"] = JSON.stringify({
      "https://feed.example.com": { skipIntro: 1.5, skipOutro: 0, defaultSpeed: 1.0 },
    });

    const startState: AppState = {
      ...defaultState,
      playlist: [
        { media: "next.mp3", currentTime: 0, audioOrigin: "https://feed.example.com" },
      ] as PlaylistItem[],
    };

    completeEpisode(startState);

    // skipIntro = 1.5 min → 90 s
    expect(mockPlayer.currentTime).toBe(90);
  });

  it("should NOT apply skip intro when next episode has a saved position", () => {
    store["podcastSettings"] = JSON.stringify({
      "https://feed.example.com": { skipIntro: 2, skipOutro: 0, defaultSpeed: 1.0 },
    });

    const startState: AppState = {
      ...defaultState,
      playlist: [
        { media: "next.mp3", currentTime: 300, audioOrigin: "https://feed.example.com" },
      ] as PlaylistItem[],
    };

    completeEpisode(startState);

    // Should use saved position, not skip intro
    expect(mockPlayer.currentTime).toBe(300);
  });

  it("should apply default speed when transitioning to next playlist item", () => {
    store["podcastSettings"] = JSON.stringify({
      "https://feed.example.com": { skipIntro: 0, skipOutro: 0, defaultSpeed: 1.7 },
    });

    const startState: AppState = {
      ...defaultState,
      playlist: [
        { media: "next.mp3", currentTime: 0, audioOrigin: "https://feed.example.com" },
      ] as PlaylistItem[],
    };

    completeEpisode(startState);

    expect(mockPlayer.playbackRate).toBe(1.7);
  });

  it("should NOT change speed when default speed is 1.0", () => {
    store["podcastSettings"] = JSON.stringify({
      "https://feed.example.com": { skipIntro: 0, skipOutro: 0, defaultSpeed: 1.0 },
    });

    mockPlayer.playbackRate = 2.0; // user had previously set 2x

    const startState: AppState = {
      ...defaultState,
      playlist: [
        { media: "next.mp3", currentTime: 0, audioOrigin: "https://feed.example.com" },
      ] as PlaylistItem[],
    };

    completeEpisode(startState);

    // defaultSpeed is 1.0 → condition skips, keeps existing rate
    expect(mockPlayer.playbackRate).toBe(2.0);
  });

  it("should work without podcast settings (no audioOrigin)", () => {
    const startState: AppState = {
      ...defaultState,
      playlist: [
        { media: "next.mp3", currentTime: 0 },
      ] as PlaylistItem[],
    };

    completeEpisode(startState);

    expect(mockPlayer.currentTime).toBe(0);
    expect(mockPlayer.playbackRate).toBe(1.0);
  });
});
