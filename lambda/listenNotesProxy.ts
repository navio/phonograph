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
    return {
      statusCode: response.status,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
      body: text || "{}",
    };
  } catch (error) {
    console.error("listenNotesProxy failed:", error);
    return json(502, { error: "Upstream Listen Notes request failed." });
  }
};

export default handler;
