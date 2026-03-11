import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import attachEvents from "./events";
import { AppState } from "../types/app";
import { defaultState } from "../reducer";
import * as settingsStorage from "../podcast/PodcastView/settingsStorage";

// ---------------------------------------------------------------------------
// Mock podcastsuite (imported transitively by reducer)
// ---------------------------------------------------------------------------
vi.mock("podcastsuite", () => ({
  default: {
    createDatabase: () => ({
      get: vi.fn(async () => ({})),
      set: vi.fn(async () => {}),
    }),
  },
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Create a minimal mock HTMLAudioElement with event-listener support. */
function createMockPlayer(overrides: Partial<HTMLAudioElement> = {}) {
  const listeners: Record<string, Function[]> = {};
  return {
    src: "https://cdn.example.com/episode1.mp3",
    currentTime: 0,
    duration: 3600, // 1 hour
    playbackRate: 1.0,
    buffered: {
      length: 1,
      start: () => 0,
      end: () => 1800,
    },
    play: vi.fn(async () => {}),
    pause: vi.fn(),
    addEventListener: vi.fn((event: string, handler: Function) => {
      (listeners[event] ??= []).push(handler);
    }),
    removeEventListener: vi.fn((event: string, handler: Function) => {
      listeners[event] = (listeners[event] || []).filter((h) => h !== handler);
    }),
    /** Fire a registered event handler by name. */
    _fire(event: string) {
      (listeners[event] || []).forEach((fn) => fn(new Event(event)));
    },
    ...overrides,
  } as unknown as HTMLAudioElement & { _fire: (e: string) => void };
}

// ---------------------------------------------------------------------------
// Shared state
// ---------------------------------------------------------------------------
let player: ReturnType<typeof createMockPlayer>;
let dispatch: ReturnType<typeof vi.fn>;
let state: AppState;
let cleanup: () => void;
const store: Record<string, string> = {};

const mockStorage = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    store[key] = value;
  }),
  removeItem: vi.fn((key: string) => delete store[key]),
};

beforeEach(() => {
  Object.keys(store).forEach((k) => delete store[k]);
  vi.stubGlobal("localStorage", mockStorage);
  vi.stubGlobal("window", { localStorage: mockStorage });
  vi.stubGlobal("navigator", {
    mediaSession: {
      playbackState: "none",
      metadata: null,
      setActionHandler: vi.fn(),
    },
  });

  player = createMockPlayer();
  dispatch = vi.fn() as any;
  state = { ...defaultState };
  cleanup = attachEvents(player as unknown as HTMLAudioElement, dispatch as any, state);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

// ---------------------------------------------------------------------------
// Skip intro
// ---------------------------------------------------------------------------
describe("playTick – skip intro", () => {
  it("seeks past the intro when settings exist and currentTime is near 0", () => {
    store["state"] = JSON.stringify({ audioOrigin: "https://feed.example.com" });
    store["podcastSettings"] = JSON.stringify({
      "https://feed.example.com": { skipIntro: 2, skipOutro: 0, defaultSpeed: 1.0 },
    });

    player.currentTime = 0;
    player._fire("play");

    // skipIntro = 2 min → 120 s
    expect(player.currentTime).toBe(120);
  });

  it("does NOT apply skip intro when resuming (currentTime > 2)", () => {
    store["state"] = JSON.stringify({ audioOrigin: "https://feed.example.com" });
    store["podcastSettings"] = JSON.stringify({
      "https://feed.example.com": { skipIntro: 2, skipOutro: 0, defaultSpeed: 1.0 },
    });

    player.currentTime = 300; // resuming at 5 min
    player._fire("play");

    expect(player.currentTime).toBe(300);
  });

  it("does NOT apply skip intro on a second play of the same source", () => {
    store["state"] = JSON.stringify({ audioOrigin: "https://feed.example.com" });
    store["podcastSettings"] = JSON.stringify({
      "https://feed.example.com": { skipIntro: 1, skipOutro: 0, defaultSpeed: 1.0 },
    });

    player.currentTime = 0;
    player._fire("play");
    expect(player.currentTime).toBe(60);

    // Simulate pause then play again (same src)
    player.currentTime = 60;
    player._fire("play");
    // Should NOT reset to 60 again — src hasn't changed
    expect(player.currentTime).toBe(60);
  });

  it("applies skip intro when the source changes to a new episode", () => {
    store["state"] = JSON.stringify({ audioOrigin: "https://feed.example.com" });
    store["podcastSettings"] = JSON.stringify({
      "https://feed.example.com": { skipIntro: 1, skipOutro: 0, defaultSpeed: 1.0 },
    });

    player.currentTime = 0;
    player._fire("play");
    expect(player.currentTime).toBe(60);

    // Source changes to a new episode
    (player as any).src = "https://cdn.example.com/episode2.mp3";
    player.currentTime = 0;
    player._fire("play");
    expect(player.currentTime).toBe(60);
  });

  it("does nothing when skipIntro is 0", () => {
    store["state"] = JSON.stringify({ audioOrigin: "https://feed.example.com" });
    store["podcastSettings"] = JSON.stringify({
      "https://feed.example.com": { skipIntro: 0, skipOutro: 0, defaultSpeed: 1.0 },
    });

    player.currentTime = 0;
    player._fire("play");
    expect(player.currentTime).toBe(0);
  });

  it("does nothing when no podcast settings exist", () => {
    // no podcastSettings in store
    store["state"] = JSON.stringify({ audioOrigin: "https://feed.example.com" });

    player.currentTime = 0;
    player._fire("play");
    expect(player.currentTime).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Default speed
// ---------------------------------------------------------------------------
describe("playTick – default speed", () => {
  it("applies the configured default speed on a new source", () => {
    store["state"] = JSON.stringify({ audioOrigin: "https://feed.example.com" });
    store["podcastSettings"] = JSON.stringify({
      "https://feed.example.com": { skipIntro: 0, skipOutro: 0, defaultSpeed: 1.5 },
    });

    player._fire("play");
    expect(player.playbackRate).toBe(1.5);
  });

  it("does NOT change speed when defaultSpeed is 1.0", () => {
    store["state"] = JSON.stringify({ audioOrigin: "https://feed.example.com" });
    store["podcastSettings"] = JSON.stringify({
      "https://feed.example.com": { skipIntro: 0, skipOutro: 0, defaultSpeed: 1.0 },
    });

    player.playbackRate = 1.0;
    player._fire("play");
    expect(player.playbackRate).toBe(1.0);
  });

  it("does NOT re-apply speed on resume of the same source", () => {
    store["state"] = JSON.stringify({ audioOrigin: "https://feed.example.com" });
    store["podcastSettings"] = JSON.stringify({
      "https://feed.example.com": { skipIntro: 0, skipOutro: 0, defaultSpeed: 1.5 },
    });

    player._fire("play");
    expect(player.playbackRate).toBe(1.5);

    // User manually changes speed
    player.playbackRate = 2.0;

    // Resume same source — should NOT override the user's manual change
    player._fire("play");
    expect(player.playbackRate).toBe(2.0);
  });
});

// ---------------------------------------------------------------------------
// Skip outro
// ---------------------------------------------------------------------------
describe("playTick interval – skip outro", () => {
  it("dispatches audioCompleted when remaining time <= skipOutro", () => {
    vi.useFakeTimers();

    store["state"] = JSON.stringify({ audioOrigin: "https://feed.example.com" });
    store["podcastSettings"] = JSON.stringify({
      "https://feed.example.com": { skipIntro: 0, skipOutro: 2, defaultSpeed: 1.0 },
    });

    // Episode is 1 hour, currently at 58:30 → 1.5 min remaining (< 2 min skip)
    (player as any).duration = 3600;
    player.currentTime = 3510;

    player._fire("play");
    dispatch.mockClear();

    vi.advanceTimersByTime(500);

    const completed = dispatch.mock.calls.find(
      (c: any[]) => c[0].type === "audioCompleted"
    );
    expect(completed).toBeDefined();
  });

  it("does NOT trigger when remaining time is larger than skipOutro", () => {
    vi.useFakeTimers();

    store["state"] = JSON.stringify({ audioOrigin: "https://feed.example.com" });
    store["podcastSettings"] = JSON.stringify({
      "https://feed.example.com": { skipIntro: 0, skipOutro: 2, defaultSpeed: 1.0 },
    });

    // 30 min remaining — well above the 2 min skip window
    (player as any).duration = 3600;
    player.currentTime = 1800;

    player._fire("play");
    dispatch.mockClear();

    vi.advanceTimersByTime(500);

    const completed = dispatch.mock.calls.find(
      (c: any[]) => c[0].type === "audioCompleted"
    );
    expect(completed).toBeUndefined();
  });

  it("does NOT trigger when currentTime is still in the intro zone", () => {
    vi.useFakeTimers();

    store["state"] = JSON.stringify({ audioOrigin: "https://feed.example.com" });
    store["podcastSettings"] = JSON.stringify({
      "https://feed.example.com": { skipIntro: 0, skipOutro: 5, defaultSpeed: 1.0 },
    });

    // Very short episode (3 min) — currentTime=0 means remaining=180s which is
    // <= 300s (5 min), but currentTime (0) is NOT > skipOutroSec (300).
    // The guard prevents false positives on short episodes.
    (player as any).duration = 180;
    player.currentTime = 0;

    player._fire("play");
    dispatch.mockClear();

    vi.advanceTimersByTime(500);

    const completed = dispatch.mock.calls.find(
      (c: any[]) => c[0].type === "audioCompleted"
    );
    expect(completed).toBeUndefined();
  });

  it("does nothing when skipOutro is 0", () => {
    vi.useFakeTimers();

    store["state"] = JSON.stringify({ audioOrigin: "https://feed.example.com" });
    store["podcastSettings"] = JSON.stringify({
      "https://feed.example.com": { skipIntro: 0, skipOutro: 0, defaultSpeed: 1.0 },
    });

    (player as any).duration = 3600;
    player.currentTime = 3590; // 10 s remaining

    player._fire("play");
    dispatch.mockClear();

    vi.advanceTimersByTime(500);

    const completed = dispatch.mock.calls.find(
      (c: any[]) => c[0].type === "audioCompleted"
    );
    expect(completed).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Cleanup
// ---------------------------------------------------------------------------
describe("attachEvents cleanup", () => {
  it("removes all event listeners on cleanup", () => {
    cleanup();
    expect(player.removeEventListener).toHaveBeenCalledWith("play", expect.any(Function));
    expect(player.removeEventListener).toHaveBeenCalledWith("pause", expect.any(Function));
    expect(player.removeEventListener).toHaveBeenCalledWith("canplay", expect.any(Function));
    expect(player.removeEventListener).toHaveBeenCalledWith("ended", expect.any(Function));
  });
});
