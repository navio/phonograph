import type { Handler } from "@netlify/functions";
import fetch from "node-fetch";

export const handler: Handler = async (event) => {
  const params = event.queryStringParameters || {};
  const headers = {
    "User-Agent": "podcastsuite",
    Accept: "application/json",
    "X-ListenAPI-Key": process.env.listennotes || "",
  };

  // Preserve the downstream path so /ln/best_podcasts, /ln/typeahead, etc. work.
  const rawPath = event.path || "";
  const strippedPath = rawPath.replace(/^\/\.netlify\/functions\/listenNotesProxy/, "");
  const downstreamPath = strippedPath || "/search";
  const qs = new URLSearchParams(params as Record<string, string>).toString();
  const url = `https://listen-api.listennotes.com/api/v2${downstreamPath}${qs ? `?${qs}` : ""}`;

  try {
    const response = await fetch(url, { headers });
    const body = await response.text();
    return {
      statusCode: 200,
      body,
      headers: { "Content-Type": "application/json" },
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: "Failed to query Listen Notes",
    };
  }
};

export default handler;
