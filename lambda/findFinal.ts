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

  try {
    const response = await fetch(term, { method: "HEAD", redirect: "follow" as any });
    const url = response.url || term;
    return {
      statusCode: 200,
      body: JSON.stringify({ url }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to resolve URL" }),
    };
  }
};

export default handler;
