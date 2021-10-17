import fetch from "node-fetch"
export const handler = async (event, context, callback) => {
    const term = event.queryStringParameters.term;
    if(!term) return {
        statusCode: 400,
        body: 'Invalid Request'
    }
    const headers = {
      'User-Agent': 'podcastsuite',
      'Accept': 'application/rss+xml'
    }
    const final = !term.includes("http") ? 'https://' + term : term;
    try{
    const response = await fetch(final, {headers})
    const xml = await response.text();
    const toString = ''+xml
    return  {
      statusCode: 200,
      body: toString
    }
  }catch(err){
    console.error(err);
    throw new Error('here');
  }
}