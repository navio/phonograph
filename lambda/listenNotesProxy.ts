import type { Handler } from "@netlify/functions";
import fetch from "node-fetch";

const LISTEN_NOTES_BASE = "https://listen-api.listennotes.com/api/v2/";

const json = (statusCode: number, bodyObj: Record<string, unknown>) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
  },
  body: JSON.stringify(bodyObj),
});

export const handler: Handler = async (event) => {
  const apiKey = process.env.LISTEN_NOTES_API_KEY || process.env.LISTENNOTES || process.env.listennotes;
  if (!apiKey) {
    return json(500, {
      error: "Missing Listen Notes API key env var. Set LISTEN_NOTES_API_KEY (preferred) or LISTENNOTES.",
    });
  }

  const rawPath = event.path || "";
  const prefixes = [
    "/.netlify/functions/listenNotesProxy/",
    "/.netlify/functions/listenNotesProxy",
    "/ln/",
    "/ln",
  ];

  let remainder = rawPath;
  for (const p of prefixes) {
    if (remainder.startsWith(p)) {
      remainder = remainder.slice(p.length);
      break;
    }
  }
  remainder = remainder.replace(/^\/+/, "");

  if (!remainder) {
    return json(400, { error: `Missing Listen Notes path splat for request path: ${rawPath}` });
  }

  const url = new URL(remainder, LISTEN_NOTES_BASE);

  const qs = event.queryStringParameters || {};
  for (const [k, v] of Object.entries(qs)) {
    if (typeof v === "string") url.searchParams.set(k, v);
  }

  const cacheHeadersForPath = (pathname: string) => {
    // Default: do not cache.
    // Only cache endpoints that are effectively static and safe.
    // CDN caches will key by full URL (including query params).
    const week = 60 * 60 * 24 * 7;
    const day = 60 * 60 * 24;

    if (pathname === "/genres") {
      const ttl = week * 4; // ~30 days
      return {
        // short browser cache, long CDN cache
        "Cache-Control": `public, max-age=300`,
        "Netlify-CDN-Cache-Control": `public, s-maxage=${ttl}, stale-while-revalidate=${day}`,
      };
    }

    if (pathname === "/best_podcasts") {
      const ttl = week;
      return {
        "Cache-Control": `public, max-age=300`,
        "Netlify-CDN-Cache-Control": `public, s-maxage=${ttl}, stale-while-revalidate=${day}`,
      };
    }

    return { "Cache-Control": "no-store" };
  };

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "User-Agent": "podcastsuite",
        Accept: "application/json",
        "X-ListenAPI-Key": apiKey,
        "X-From": "Gramophone",
      },
    });

    const text = await response.text();

    // Only cache successful responses.
    const cacheHeaders = response.ok ? cacheHeadersForPath(url.pathname) : { "Cache-Control": "no-store" };

    return {
      statusCode: response.status,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        ...cacheHeaders,
      },
      body: text || "{}",
    };
  } catch (error) {
    console.error("listenNotesProxy failed:", error);
    return json(502, { error: "Upstream Listen Notes request failed." });
  }
};

export default handler;
