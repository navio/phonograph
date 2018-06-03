import Parser,{load} from './parser'; 

const DEFAULTCAST = { domain: "www.npr.org/rss/podcast.php?id=510289" , protocol:'https:'};

let PROXY = {'https:':'/rss/','http:':'/rss-less/'};

if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    PROXY = {'https:':'https://cors-anywhere.herokuapp.com/','http:':'https://cors-anywhere.herokuapp.com/'};
}

export const loadEpisodes = function(RSS) {
    RSS.forEach(item => this.episodes.set(item.guid, item));
}

export const fillPodcastContent = function(cast) {
    let podcast = (typeof cast === 'string') ? createCast(cast) : cast;

    let CORS_PROXY = PROXY[podcast.protocol];
    let found = window.localStorage.getItem('current'+podcast.domain);
    return new Promise((accept,reject) => {
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
            window.localStorage.setItem('current'+podcast.domain, JSON.stringify(RSS));
            accept(RSS);
          });
      } else {
        let content = JSON.parse(found);
        this.setState({
          items: (content.items && content.items.slice(0, 20)) || [],
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
              window.localStorage.setItem('current'+podcast.domain, JSON.stringify(RSS));
              this.setState({
                  items: RSS.items.slice(0, 20),
                  title: RSS.title,
                  image: RSS.image,
                  link: RSS.url,
                  description: RSS.description
              });
              this.episodes.clear();
              loadEpisodes.call(this,RSS.items);
              }
          });
        accept(content);
      }
    })

}

export const clearDomain = (domain) => domain.replace(/(^\w+:|^)\/\//, '');

export const createCast = (url) =>{ // Todo: try https, then http otherwise fail.
  if (!url) return null;
  let fixURL = url.search("http") < 0 ? `https://${url}`: url;
  try{
    let podcast = new URL(fixURL);
    let domain =   clearDomain(podcast.href);
    let protocol = podcast.protocol
    return { domain , protocol };
  }catch(error){
    console.info('Error Parsing Domain');
    return null;
  }
}

export const getPodcasts = function(podcasts){
  return new Promise((acc,rej) => {
    Promise.all(podcasts.map(cast =>{
      let podcast = createCast(cast);
      let CORS_PROXY = PROXY[podcast.protocol];
      let found = window.localStorage.getItem(podcast.domain);
      if(found){
        return Promise.resolve(JSON.parse(found));
      }else{
        return new Promise((resolve,reject)=>{
          console.log("fetching:",podcast.domain)
          load(CORS_PROXY + podcast.domain)
          .then(RSS =>{
              delete RSS['items'];
              RSS.domain = podcast.domain;
              resolve(RSS)
          });
        })
      }
    }))
    .then(RSS => {
      let clean = RSS.filter(rss=>rss['error']?false:true); 
      clean.forEach((rss)=>{console.log('Saving',rss.domain);
        window.localStorage.setItem(rss.domain,JSON.stringify(rss))
      })
      console.log(clean);
      acc(clean);
    })


  })
}

export const checkIfNewPodcast = function() {
    if(!window && !window.location ) return DEFAULTCAST;

    let urlPodcast = new window.URL(window.location.href);
    let podcast = urlPodcast.searchParams.get("podcast");

    return createCast(podcast);

}

export const loadPodcast = function(ev){
 
    let podcast = ev.currentTarget.getAttribute('domain');
    if(this.podcasts.has(podcast)){
      let {title,image,description} = this.podcasts.get(podcast);
      this.setState({
        title,
        image,
        description,
      })
    }
      fillPodcastContent.call(this,podcast)
      .then((data)=>{
        this.setState({
          view:'podcast'
        });
      })
}