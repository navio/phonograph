import fetch from "node-fetch"
export const handler = async (event, context, callback) => {
  const term = event.queryStringParameters.term;
  if (!term) return {
    statusCode: 400,
    body: 'Invalid Request'
  }
  const headers = {
    'User-Agent': 'podcastsuite',
    'Accept': 'application/rss+xml'
  }
  const response = await fetch(term, { method: 'HEAD', headers });
  const {url} = response;
  return {
    statusCode: 200,
    body: JSON.stringify({ url })
  }
}