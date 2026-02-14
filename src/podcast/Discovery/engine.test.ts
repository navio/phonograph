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

    it("should fall back to Listen Notes if Apple fails (empty)", async () => {
      // Apple returns empty or error
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: async () => "",
      });

      // Listen Notes returns results
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [
            {
              rss: "http://ln.com",
              title_original: "LN Podcast",
              publisher_original: "LN Artist",
              thumbnail: "ln.jpg",
              genre_ids: [1],
            },
          ],
        }),
      });

      const results = await searchForPodcasts("test");
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe("LN Podcast");
      expect(results[0].rss).toBe("http://ln.com");
    });
  });

  describe("getPopularPodcasts", () => {
    it("should fetch popular podcasts", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          podcasts: [
            {
              title: "Popular Cast",
              domain: "domain",
              thumbnail: "img.jpg",
              description: "desc",
              id: "123",
              total_episodes: 10,
              earliest_pub_date_ms: 1000,
              publisher: "Pub",
            },
          ],
          name: "Trending",
        }),
      });

      const response = await getPopularPodcasts(null);
      expect(response.top).toHaveLength(1);
      expect(response.top[0].title).toBe("1. Popular Cast");
      expect(response.name).toBe("Trending");
    });

    it("should handle fetch failure", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      // Pass a query to bypass internal memory cache
      const response = await getPopularPodcasts(9999);
      expect(response.error).toBe(true);
      expect(response.top).toEqual([]);
    });
  });
});
