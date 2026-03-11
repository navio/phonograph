import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getPodcastSettings,
  savePodcastSettings,
  getSettingsForCurrentPodcast,
  defaultSettings,
} from "./settingsStorage";

// ---------------------------------------------------------------------------
// localStorage stub
// ---------------------------------------------------------------------------
const store: Record<string, string> = {};

const mockStorage = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    store[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete store[key];
  }),
};

beforeEach(() => {
  Object.keys(store).forEach((k) => delete store[k]);
  vi.stubGlobal("localStorage", mockStorage);
  // settingsStorage checks `typeof window` and `window.localStorage`
  vi.stubGlobal("window", { localStorage: mockStorage });
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// getPodcastSettings
// ---------------------------------------------------------------------------
describe("getPodcastSettings", () => {
  it("returns defaults when nothing is stored", () => {
    expect(getPodcastSettings("https://example.com/feed.xml")).toEqual(
      defaultSettings
    );
  });

  it("returns defaults for an empty podcastUrl", () => {
    expect(getPodcastSettings("")).toEqual(defaultSettings);
  });

  it("returns saved settings merged with defaults", () => {
    store["podcastSettings"] = JSON.stringify({
      "https://example.com/feed.xml": { skipIntro: 2 },
    });

    const result = getPodcastSettings("https://example.com/feed.xml");
    expect(result).toEqual({ skipIntro: 2, skipOutro: 0, defaultSpeed: 1.0 });
  });

  it("returns defaults for a podcast with no entry", () => {
    store["podcastSettings"] = JSON.stringify({
      "https://other.com/feed.xml": { skipIntro: 3 },
    });

    expect(getPodcastSettings("https://example.com/feed.xml")).toEqual(
      defaultSettings
    );
  });

  it("handles corrupted JSON gracefully", () => {
    store["podcastSettings"] = "NOT_JSON{{{";
    expect(getPodcastSettings("https://example.com/feed.xml")).toEqual(
      defaultSettings
    );
  });
});

// ---------------------------------------------------------------------------
// savePodcastSettings
// ---------------------------------------------------------------------------
describe("savePodcastSettings", () => {
  it("saves a partial update and returns the merged result", () => {
    const result = savePodcastSettings("https://example.com/feed.xml", {
      skipIntro: 3,
    });
    expect(result).toEqual({ skipIntro: 3, skipOutro: 0, defaultSpeed: 1.0 });

    // Verify localStorage was written
    const persisted = JSON.parse(store["podcastSettings"]);
    expect(persisted["https://example.com/feed.xml"]).toEqual(result);
  });

  it("merges successive saves for the same podcast", () => {
    savePodcastSettings("https://example.com/feed.xml", { skipIntro: 1 });
    savePodcastSettings("https://example.com/feed.xml", { skipOutro: 2.5 });
    const result = savePodcastSettings("https://example.com/feed.xml", {
      defaultSpeed: 1.5,
    });

    expect(result).toEqual({
      skipIntro: 1,
      skipOutro: 2.5,
      defaultSpeed: 1.5,
    });
  });

  it("keeps settings for different podcasts separate", () => {
    savePodcastSettings("https://a.com/feed.xml", { skipIntro: 1 });
    savePodcastSettings("https://b.com/feed.xml", { skipIntro: 4 });

    expect(getPodcastSettings("https://a.com/feed.xml").skipIntro).toBe(1);
    expect(getPodcastSettings("https://b.com/feed.xml").skipIntro).toBe(4);
  });

  it("overwrites a single field without touching others", () => {
    savePodcastSettings("https://example.com/feed.xml", {
      skipIntro: 2,
      skipOutro: 3,
      defaultSpeed: 1.7,
    });
    const result = savePodcastSettings("https://example.com/feed.xml", {
      defaultSpeed: 2.0,
    });

    expect(result).toEqual({
      skipIntro: 2,
      skipOutro: 3,
      defaultSpeed: 2.0,
    });
  });
});

// ---------------------------------------------------------------------------
// getSettingsForCurrentPodcast
// ---------------------------------------------------------------------------
describe("getSettingsForCurrentPodcast", () => {
  it("returns null when no app state is stored", () => {
    expect(getSettingsForCurrentPodcast()).toBeNull();
  });

  it("returns null when audioOrigin is missing from state", () => {
    store["state"] = JSON.stringify({ podcasts: [] });
    expect(getSettingsForCurrentPodcast()).toBeNull();
  });

  it("returns null when audioOrigin is empty string", () => {
    store["state"] = JSON.stringify({ audioOrigin: "" });
    expect(getSettingsForCurrentPodcast()).toBeNull();
  });

  it("returns defaults when audioOrigin has no saved settings", () => {
    store["state"] = JSON.stringify({
      audioOrigin: "https://example.com/feed.xml",
    });
    expect(getSettingsForCurrentPodcast()).toEqual(defaultSettings);
  });

  it("returns the correct settings for the currently playing podcast", () => {
    savePodcastSettings("https://example.com/feed.xml", {
      skipIntro: 2,
      defaultSpeed: 1.5,
    });
    store["state"] = JSON.stringify({
      audioOrigin: "https://example.com/feed.xml",
    });

    expect(getSettingsForCurrentPodcast()).toEqual({
      skipIntro: 2,
      skipOutro: 0,
      defaultSpeed: 1.5,
    });
  });

  it("handles corrupted app state gracefully", () => {
    store["state"] = "CORRUPTED";
    expect(getSettingsForCurrentPodcast()).toBeNull();
  });
});
