import { describe, it, expect, vi, beforeEach } from "vitest";

// reducer.js imports podcastsuite at module-load time.
// Provide a minimal mock so tests can run in Node.
vi.mock("podcastsuite", () => {
  const db = {
    get: vi.fn(async () => null),
    set: vi.fn(async () => true),
    del: vi.fn(async () => true),
  };
  return {
    default: {
      createDatabase: vi.fn(() => db),
      db,
    },
  };
});

// Import after mocks
import { useAppStore } from "./appStore";
import { AppAction } from "../types/app";

const dispatch = (action: AppAction) => useAppStore.getState().dispatch(action);
const state = () => useAppStore.getState().state;

beforeEach(() => {
  dispatch({ type: "resetState" });
});

describe("useAppStore dispatch parity", () => {
  it("addNext unshifts into playlist", () => {
    dispatch({ type: "addLast", payload: { media: "a" } });
    dispatch({ type: "addLast", payload: { media: "b" } });

    dispatch({ type: "addNext", payload: { media: "X" } });

    expect(state().playlist.map((x) => x.media)).toEqual(["X", "a", "b"]);
  });

  it("removeFromPlayList removes by index", () => {
    dispatch({ type: "addLast", payload: { media: "a" } });
    dispatch({ type: "addLast", payload: { media: "b" } });
    dispatch({ type: "addLast", payload: { media: "c" } });

    dispatch({ type: "removeFromPlayList", episode: 1 });

    expect(state().playlist.map((x) => x.media)).toEqual(["a", "c"]);
  });

  it("clearPlayList clears playlist", () => {
    dispatch({ type: "addLast", payload: { media: "a" } });
    dispatch({ type: "addLast", payload: { media: "b" } });

    dispatch({ type: "clearPlayList" });

    expect(state().playlist).toEqual([]);
  });

  it("audioUpdate paused merges payload and refreshes", () => {
    const before = state().refresh;

    dispatch({
      type: "audioUpdate",
      payload: { status: "paused", currentTime: 123, duration: 999 },
    });

    expect(state().status).toBe("paused");
    expect(state().currentTime).toBe(123);
    expect(state().duration).toBe(999);
    expect(state().refresh).not.toBe(before);
  });

  it("audioCompleted advances to next queued episode when available", () => {
    // completeEpisode reads window.player; provide a stub.
    globalThis.window = {
      player: { src: "", currentTime: 0 } as any,
    } as any;

    dispatch({
      type: "audioUpdate",
      payload: {
        audioOrigin: "feed",
        media: "current",
        episodeInfo: { guid: "g0", title: "Current" },
        currentTime: 10,
      },
    });

    dispatch({
      type: "addLast",
      payload: {
        media: "next1",
        episodeInfo: { guid: "g1", title: "Next" },
        currentTime: 5,
      },
    });

    dispatch({ type: "audioCompleted" });

    expect(state().media).toBe("next1");
    expect(state().episodeInfo.guid).toBe("g1");
  });
});
