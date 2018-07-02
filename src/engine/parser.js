import xml2js from 'xml2js';

const parser = new xml2js.Parser({ trim: false, normalize: true, mergeAttrs: true });

export const fetchRSS = (url) => fetch(url,{method:'GET', headers: {
      'User-Agent': 'rss-parser',
      'Accept': 'application/rss+xml'
  }});
export const load = (url) => {
    return new Promise((accept,reject)=>{
      fetchRSS(url)
      .then(((res) => {

        if(!res.ok) reject(res);

        res.text()
        .catch(error=>reject(error))
        .then(content => parse(content)
                         .catch(per=>reject(per))
                         .then(rss=>accept(rss)));
        }));
    });
  };

export const parse = (content) => new Promise((accept,reject)=>{
  // parser.reset()
  try{
    parser.parseString(content,(err, result) =>{
      if(err){ accept({error:true}); console.error('Error Parsing') }
      accept(cleanXML(result));
    });
  }catch(error){
    reject(error)
  }
    
  });
  
export const cleanXML = (json) => {
    var channel = json.rss.channel;
    var rss = { items: [] };
    if (Array.isArray(json.rss.channel))
      channel = json.rss.channel[0];

    if (channel.title) {
      rss.title = channel.title[0];
    }
    if (channel.description) {
      rss.description = channel.description[0];
    }
    if (channel.link) {
      rss.url = channel.link[0];
    }

    if (channel.image) {
      rss.image = channel.image[0].url
    }

    if (!rss.image && channel["itunes:image"]) {
      rss.image = channel['itunes:image'][0].href
    }

    rss.image = rss.image && Array.isArray(rss.image) ? rss.image[0] : '';

    if (channel.item) {
      if (!Array.isArray(channel.item)) {
        channel.item = [channel.item];
	  }
      channel.item.forEach(function (val) {
        var obj = {};
        obj.title = (val.title) ? val.title[0] : '';
        obj.description = (val.description) ? val.description[0] : '';
        obj.url = obj.link = (val.link) ? val.link[0] : '';
		    obj.guid = val.guid && val.guid[0] && ( val.guid[0]['_'] || val.guid[0] );

        if (val['itunes:subtitle']) {
          obj.itunes_subtitle = val['itunes:subtitle'][0];
        }
        if (val['itunes:summary']) {
          obj.itunes_summary = val['itunes:summary'][0];
        }
        if (val['itunes:author']) {
          obj.itunes_author = val['itunes:author'][0];
        }
        if (val['itunes:explicit']) {
          obj.itunes_explicit = val['itunes:explicit'][0];
        }
        if (val['itunes:duration']) {
          obj.itunes_duration = val['itunes:duration'][0];
        }
        if (val['itunes:season']) {
          obj.itunes_season = val['itunes:season'][0];
        }
        if (val['itunes:episode']) {
          obj.itunes_episode = val['itunes:episode'][0];
        }
        if (val['itunes:episodeType']) {
          obj.itunes_episodeType = val['itunes:episodeType'][0];
        }
        if (val.pubDate) {
          obj.created = Date.parse(val.pubDate[0]);
        }
        if (val['media:content']) {
          obj.media = val.media || {};
          obj.media.content = val['media:content'];
        }
        if (val['media:thumbnail']) {
          obj.media = val.media || {};
          obj.media.thumbnail = val['media:thumbnail'];
		}
		
        if (val.enclosure) {
          obj.enclosures = [];
          if (!Array.isArray(val.enclosure))
            val.enclosure = [val.enclosure];
          val.enclosure.forEach(function (enclosure) {
            var enc = {};
            for (var x in enclosure) {
              enc[x] = enclosure[x][0];
            }
            obj.enclosures.push(enc);
          });

        }
        rss.items.push(obj);

      });

    }
    return rss;

  };

export default (feed) => load(feed);
