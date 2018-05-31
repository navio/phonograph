import Parser from './parser';

let PROXY = {'https:':'/rss/','http:':'/rss-less/'};

if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
  PROXY = {'https:':'https://cors-anywhere.herokuapp.com/','http:':'https://cors-anywhere.herokuapp.com/'};
}

const DEFAULTCAST = "www.npr.org/rss/podcast.php?id=510289";



const loadEpisodes = function(RSS) {
    RSS.forEach(item => this.episodes.set(item.guid, item));
}

export const fillPodcastContent = function(podcast) {

    let CORS_PROXY = PROXY[podcast.protocol];
    let found = window.localStorage.getItem(podcast.domain);
    
    if (!found) {
      this.episodes.clear();
      Parser(CORS_PROXY + podcast.domain)
        .then((RSS) => { 
          this.setState({ 
            items: RSS.items.slice(0, 20),
            title: RSS.title,
            image: RSS.image,
            link: RSS.url,
            description: RSS.description
          });
          loadEpisodes.call(this,RSS.items);
          window.localStorage.setItem(podcast.domain, JSON.stringify(RSS));
        });
    } else {
      let content = JSON.parse(found);
      this.setState({
        items: content.items.slice(0, 20),
        title: content.title,
        description: content.description,
        image: content.image,
        link: content.url
      });

      this.episodes.clear();
      loadEpisodes.call(this,content.items);
      Parser(CORS_PROXY + podcast.domain) //Background.
        .then((RSS) => { 
            let newReading = JSON.stringify(RSS);
            if (newReading !== found) {
            console.log('Updated');
            window.localStorage.setItem(podcast.domain, JSON.stringify(RSS));
            this.setState({
                items: RSS.items.slice(0, 20)
            });
            this.episodes.clear();
            loadEpisodes.call(this,RSS.items);
            }
        });
    }
}

export const checkIfNewPodcast = function() {
    if(!window && !window.location ) return { domain: DEFAULTCAST , protocol:'https:'};

    let urlString = window.location.href;
    let urlPodcast = new window.URL(urlString);
    let podcast = urlPodcast.searchParams.get("podcast");

    try{
      if(podcast){ // Todo: try https, then http otherwise fail. Add Fail message.
        podcast = podcast.search("http") < 0 ? `https://${podcast}`: podcast;
        podcast = new URL(podcast);
        let domain =   podcast.href.replace(/(^\w+:|^)\/\//, '');
        let protocol = podcast.protocol
        return { domain , protocol };
      }
      return { domain: DEFAULTCAST , protocol:'https:'};
    }catch(err){
      console.error('Invalid URL');
      return { domain: DEFAULTCAST , protocol:'https:'};
    }
  }