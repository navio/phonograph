import { describe, it, expect, vi } from "vitest";

import { prefetchSavedPodcasts } from "./prefetchSavedPodcasts";

describe("prefetchSavedPodcasts", () => {
  it("skips when engine is unavailable", async () => {
    await expect(prefetchSavedPodcasts(null, ["https://example.com/feed.xml"])).resolves.toBeUndefined();
  });

  it("prefetches unique domains when online", async () => {
    const getPodcast = vi.fn(async () => ({}));

    await prefetchSavedPodcasts(
      { getPodcast },
      ["https://one.example/feed.xml", "https://two.example/feed.xml", "https://one.example/feed.xml"],
      true
    );

    expect(getPodcast).toHaveBeenCalledTimes(2);
    expect(getPodcast).toHaveBeenNthCalledWith(1, "https://one.example/feed.xml", { fresh: undefined });
    expect(getPodcast).toHaveBeenNthCalledWith(2, "https://two.example/feed.xml", { fresh: undefined });
  });

  it("uses Infinity freshness when offline", async () => {
    const getPodcast = vi.fn(async () => ({}));

    await prefetchSavedPodcasts({ getPodcast }, ["https://one.example/feed.xml"], false);

    expect(getPodcast).toHaveBeenCalledWith("https://one.example/feed.xml", { fresh: Infinity });
  });
});
