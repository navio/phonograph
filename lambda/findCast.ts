import type { Handler } from "@netlify/functions";
import fetch from "node-fetch";

export const handler: Handler = async (event) => {
  const term = event.queryStringParameters?.term;
  if (!term) {
    return {
      statusCode: 400,
      body: "Invalid Request",
    };
  }

  const headers = {
    "User-Agent": "podcastsuite",
    Accept: "application/rss+xml",
  };
  const final = term.includes("http") ? term : `https://${term}`;

  try {
    const response = await fetch(final, { headers });
    const xml = await response.text();
    const body = String(xml);
    return {
      statusCode: 200,
      body,
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: "Failed to fetch feed",
    };
  }
};

export default handler;
