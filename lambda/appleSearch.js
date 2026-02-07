import fetch from "node-fetch";

const buildSearchURL = (term) => {
  const url = new URL("https://itunes.apple.com/search");
  url.searchParams.set("term", term);
  url.searchParams.set("media", "podcast");
  url.searchParams.set("entity", "podcast");
  url.searchParams.set("limit", "50");
  return url.toString();
};

export const handler = async (event) => {
  const term = event.queryStringParameters?.term;
  if (!term || !term.trim()) {
    return {
      statusCode: 400,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({ error: "Missing term." }),
    };
  }

  try {
    const response = await fetch(buildSearchURL(term), {
      headers: {
        "User-Agent": "podcastsuite",
        "Accept": "application/json",
      },
    });
    const text = await response.text();
    return {
      statusCode: response.status,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: text || JSON.stringify({ results: [] }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 502,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({ results: [] }),
    };
  }
};
