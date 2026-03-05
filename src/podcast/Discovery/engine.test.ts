import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { searchForPodcasts, getPopularPodcasts } from "./engine";

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("Discovery Engine", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe("searchForPodcasts", () => {
    it("should return Apple results if found", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () =>
          JSON.stringify({
            results: [
              {
                feedUrl: "http://rss.com",
                trackName: "Apple Podcast",
                artistName: "Artist",
                artworkUrl100: "img.jpg",
                genres: ["Tech"],
              },
            ],
          }),
      });

      const results = await searchForPodcasts("test");
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe("Apple Podcast");
      expect(results[0].rss).toBe("http://rss.com");
    });

    it("should return [] when Apple search fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: async () => "",
      });

      const results = await searchForPodcasts("test");
      expect(results).toHaveLength(0);
    });
  });

  describe("getPopularPodcasts", () => {
    it("should fetch popular podcasts", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          feed: {
            results: [
              {
                id: "123",
                name: "Popular Cast",
                artistName: "Pub",
                artworkUrl100: "img.jpg",
                url: "https://podcasts.apple.com/us/podcast/popular/id123",
              },
            ],
          },
        }),
      });

      const response = await getPopularPodcasts(null);
      expect(response.top).toHaveLength(1);
      expect(response.top[0].title).toBe("1. Popular Cast");
    });

    it("should handle fetch failure", async () => {
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      // Pass a query to bypass internal memory cache
      const response = await getPopularPodcasts(9999);
      expect(response.error).toBe(true);
      expect(response.top).toEqual([]);

      spy.mockRestore();
    });
  });
});
