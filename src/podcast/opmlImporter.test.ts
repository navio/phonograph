import { describe, it, expect } from "vitest";
import { importFeeds } from "./opmlImporter";

describe("opml importer", () => {
  it("imports a successful feed", async () => {
    const engine = {
      getPodcast: async (url: string, opts: any) => {
        return { title: "ok", items: [] };
      },
    };

    const feeds = [{ url: "https://example.com/feed" }];

    const result = await importFeeds(engine, feeds, { timeoutMs: 2000, save: true });

    expect(result.successes).toEqual(["https://example.com/feed"]);
    expect(result.failures).toHaveLength(0);
  });

  it("records malformed URLs and continues", async () => {
    const engine = {
      getPodcast: async () => {
        // should not be called
        throw new Error("should not be called");
      },
    };

    const feeds = [{ url: "not-a-url" } as any];

    const result = await importFeeds(engine, feeds, { timeoutMs: 1000 });

    expect(result.successes).toHaveLength(0);
    expect(result.failures).toHaveLength(1);
    expect(result.failures[0].error).toMatch(/Malformed/);
  });

  it("times out slow feeds and continues", async () => {
    const engine = {
      getPodcast: (url: string) => new Promise((_resolve) => {
        // never resolves
      }),
    };

    const feeds = [{ url: "https://slow.example/feed" }];

    const result = await importFeeds(engine, feeds, { timeoutMs: 50 });

    expect(result.successes).toHaveLength(0);
    expect(result.failures).toHaveLength(1);
    expect(result.failures[0].error).toMatch(/Timeout/);
  });

  it("records network errors (404) and continues", async () => {
    const engine = {
      getPodcast: async () => {
        throw new Error("404 Not Found");
      },
    };

    const feeds = [{ url: "https://notfound.example/feed" }];

    const result = await importFeeds(engine, feeds, { timeoutMs: 1000 });

    expect(result.successes).toHaveLength(0);
    expect(result.failures).toHaveLength(1);
    expect(result.failures[0].error).toMatch(/404/);
  });

  it("processes a mix of good, slow and failing feeds", async () => {
    const engine = {
      getPodcast: (url: string) => {
        if (url.includes("good")) return Promise.resolve({ title: "ok" });
        if (url.includes("slow")) return new Promise((_r) => {});
        return Promise.reject(new Error("Invalid RSS"));
      },
    };

    const feeds = [
      { url: "https://good.example/feed" },
      { url: "https://slow.example/feed" },
      { url: "https://bad.example/feed" },
    ];

    const result = await importFeeds(engine, feeds, { timeoutMs: 50 });

    expect(result.successes).toEqual(["https://good.example/feed"]);
    expect(result.failures).toHaveLength(2);
    const errors = result.failures.map((f) => f.error);
    expect(errors.some((e) => /Timeout/.test(e))).toBe(true);
    expect(errors.some((e) => /Invalid RSS/.test(e))).toBe(true);
  });
});
