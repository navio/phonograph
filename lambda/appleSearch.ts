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

  const url = `https://itunes.apple.com/search?media=podcast&term=${encodeURIComponent(term)}`;

  try {
    const response = await fetch(url);
    const body = await response.text();
    return {
      statusCode: 200,
      body,
      headers: {
        "Content-Type": "application/json",
      },
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: "Failed to query iTunes",
    };
  }
};

export default handler;
