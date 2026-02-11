import fetch from "node-fetch";

const LISTEN_NOTES_BASE = "https://listen-api.listennotes.com/api/v2/";

const json = (statusCode, bodyObj) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
  },
  body: JSON.stringify(bodyObj),
});

export const handler = async (event) => {
  const apiKey = process.env.LISTEN_NOTES_API_KEY;
  if (!apiKey) {
    // This must be configured in Netlify environment variables (incl. Deploy Previews)
    return json(500, {
      error: "Missing LISTEN_NOTES_API_KEY env var on the server.",
    });
  }

  // When called via redirect:
  //   /ln/<splat> -> /.netlify/functions/listenNotesProxy/<splat>
  // event.path includes the full function path; extract the remainder.
  const prefix = "/.netlify/functions/listenNotesProxy/";
  const rawPath = event.path || "";
  const remainder = rawPath.startsWith(prefix) ? rawPath.slice(prefix.length) : "";

  const url = new URL(remainder, LISTEN_NOTES_BASE);

  // Preserve query string
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
