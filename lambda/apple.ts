import type { Handler } from "@netlify/functions";
import fetch from "node-fetch";

const APPLE_RSS_BASE = "https://rss.marketingtools.apple.com/api/v2/";
const ITUNES_BASE = "https://itunes.apple.com";

const json = (statusCode: number, body: unknown, headers?: Record<string, string>) => {
  return {
    statusCode,
    body: typeof body === "string" ? body : JSON.stringify(body),
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      // Browser cache: 3 days. Edge/CDN (service) cache: 7 days.
      "Cache-Control": "public, max-age=259200, s-maxage=604800",
      "Netlify-CDN-Cache-Control": "public, max-age=604800",
      ...headers,
    },
  };
};

export const handler: Handler = async (event) => {
  const rawPath = event.path || "";

  // Netlify will sometimes pass the original path (e.g. /apple/...) and sometimes
  // the internal functions path (/.netlify/functions/apple/...). Support both.
  const splat =
    rawPath.split("/.netlify/functions/apple/")[1] ||
    rawPath.split("/apple/")[1] ||
    "";
  const action = splat.split("/")[0] || "";

  try {
    if (action === "rss") {
      const rest = splat.replace(/^rss\//, "");
      if (!rest) return json(400, { error: "Missing RSS path" });

      // Apple RSS API format varies in docs/examples:
      // - recommended: .../{limit}.{format}
      // - sometimes shown: .../{limit}/{format}
      // Normalize the latter to the former.
      const parts = rest.split("/").filter(Boolean);
      let finalPath = rest;
      if (parts.length >= 2) {
        const maybeFormat = parts[parts.length - 1];
        const maybeLimit = parts[parts.length - 2];
        const isFormat = maybeFormat === "json" || maybeFormat === "rss";
        const isLimit = /^[0-9]+$/.test(maybeLimit);
        if (isFormat && isLimit) {
          finalPath = [...parts.slice(0, -2), `${maybeLimit}.${maybeFormat}`].join("/");
        }
      }

      const url = `${APPLE_RSS_BASE}${finalPath}`;
      const resp = await fetch(url, {
        headers: {
          "User-Agent": "phonograph",
          Accept: "application/json",
        },
      });

      const text = await resp.text();
      if (!resp.ok) {
        return json(resp.status, { error: "Apple RSS request failed", status: resp.status, url }, { "X-Apple-Proxy": "rss" });
      }

      return json(200, text, { "X-Apple-Proxy": "rss" });
    }

    if (action === "lookup") {
      const id = event.queryStringParameters?.id;
      if (!id) return json(400, { error: "Missing id" });

      const url = `${ITUNES_BASE}/lookup?id=${encodeURIComponent(id)}&entity=podcast`;
      const resp = await fetch(url, { headers: { "User-Agent": "phonograph", Accept: "application/json" } });
      const text = await resp.text();
      if (!resp.ok) {
        return json(resp.status, { error: "iTunes lookup failed", status: resp.status }, { "X-Apple-Proxy": "lookup" });
      }
      return json(200, text, { "X-Apple-Proxy": "lookup" });
    }

    if (action === "genres") {
      const id = event.queryStringParameters?.id || "26";
      const url = `${ITUNES_BASE}/WebObjects/MZStoreServices.woa/ws/genres?id=${encodeURIComponent(id)}`;
      const resp = await fetch(url, { headers: { "User-Agent": "phonograph", Accept: "application/json" } });
      const text = await resp.text();
      if (!resp.ok) {
        return json(resp.status, { error: "iTunes genres request failed", status: resp.status }, { "X-Apple-Proxy": "genres" });
      }
      return json(200, text, { "X-Apple-Proxy": "genres" });
    }

    if (action === "search") {
      const term = event.queryStringParameters?.term;
      if (!term) return json(400, { error: "Missing term" });

      const url = `${ITUNES_BASE}/search?media=podcast&term=${encodeURIComponent(term)}`;
      const resp = await fetch(url, { headers: { "User-Agent": "phonograph", Accept: "application/json" } });
      const text = await resp.text();
      if (!resp.ok) {
        return json(resp.status, { error: "iTunes search failed", status: resp.status }, { "X-Apple-Proxy": "search" });
      }
      return json(200, text, { "X-Apple-Proxy": "search" });
    }

    return json(404, { error: "Unknown apple proxy action", action });
  } catch (err: any) {
    console.error(err);
    return json(500, { error: "Apple proxy failed", message: String(err?.message || err) });
  }
};

export default handler;
