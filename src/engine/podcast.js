import Parser,{load} from './parser'; 
import {CASTVIEW,STORAGEID} from '../constants';
import {defaultCasts} from '../podcast/podcast';
import fetchJ from 'smallfetch';
import randomColor from 'randomcolor';

const DEFAULTCAST = { domain: "www.npr.org/rss/podcast.php?id=510289" , protocol:'https:'};

let PROXY = {'https:':'/rss/','http:':'/rss-less/'};
let CACHED = {'https:':'/cacheds/','http:':'/cached/'};
let SEARCH = "/podcasts/";
let DEBUG = false;

if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    DEBUG = true;
    PROXY = {'https:':'https://cors-anywhere.herokuapp.com/','http:':'https://cors-anywhere.herokuapp.com/'};
    CACHED = {'https:':'https://cors-anywhere.herokuapp.com/','http:':'https://cors-anywhere.herokuapp.com/'};
    SEARCH = `https://cors-anywhere.herokuapp.com/https://finalredirect-dotifanpnr.now.sh`;
}

export const clearDomain = 
  (domain) => domain.replace(/(^\w+:|^)\/\//, '');

export const addPodcastToLibrary = function (podcast){
  let podcastToAdd = Object.assign(podcast);
  delete podcastToAdd['items']
  this.podcasts.set(podcastToAdd.domain,podcastToAdd);
  let podcasts = [...this.podcasts.values()];
  localStorage.setItem(STORAGEID,JSON.stringify(podcasts));

  this.setState({podcasts});
}

export const loadEpisodes = function(RSS) {
    RSS.forEach(item => this.episodes.set(item.guid, item));
}

export const removeCurrentPodcast = function(){
  this.setState({ 
    items: null,
    title: '',
    image: null,
    link: null,
    description: '',
    podcast: null
  });
  this.episodes.clear();
}

export const fillPodcastContent = function(cast) {
    let podcast = (typeof cast === 'string') ? convertURLToPodcast(cast) : cast;

    let CORS_PROXY = PROXY[podcast.protocol];
    let found = sessionStorage.getItem(podcast.domain);

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
              description: RSS.description,
              podcast: podcast.domain
            });
            loadEpisodes.call(this,RSS.items);
            sessionStorage.setItem(podcast.domain, JSON.stringify(RSS));
            accept(Object.assign(RSS,podcast));
          });
      } else {
        let content = JSON.parse(found);
        this.setState({
          items: (content.items && content.items.slice(0, 20)) || [],
          title: content.title,
          description: content.description,
          image: content.image,
          link: content.url,
          podcast: podcast.domain
        });
        
        this.episodes.clear();
        loadEpisodes.call(this,content.items);
        Parser(CORS_PROXY + podcast.domain) //Background.
          .then((RSS) => { 
              let newReading = JSON.stringify(RSS);
              if (newReading !== found) {
              console.log('Updated');
              sessionStorage.setItem(podcast.domain, JSON.stringify(RSS));
              this.setState({
                  items: RSS.items.slice(0, 20),
                  title: RSS.title,
                  image: RSS.image,
                  link: RSS.url,
                  description: RSS.description,
                  podcast: podcast.domain
              });
              this.episodes.clear();
              loadEpisodes.call(this,RSS.items);
              }
          });
        accept(Object.assign(content,podcast));
      }
    })

}

export const buildLibrary = function(){

  const addToLibrary = 
  cast => !this.podcasts.has(cast.domain) && this.podcasts.set(cast.domain,cast);
  
  // Check LS
  let memoryCasts = localStorage.getItem(STORAGEID) ? JSON.parse(localStorage.getItem(STORAGEID)) :[];

  // Add Casts
  defaultCasts.forEach(addToLibrary);
  memoryCasts.forEach(addToLibrary);

}

export const convertURLToPodcast = (url) =>{ // Todo: try https, then http otherwise fail.
  if (!url) return null;
  let fixURL = url.search("http") < 0 ? `https://${url}`: url;
  try{
    let podcast = new URL(fixURL);
    let domain =  clearDomain(podcast.href);
    let protocol = podcast.protocol
    return { domain , protocol };
  }catch(error){
    console.error('Error Parsing Domain',error);
    return null;
  }
}

export const driveThruDNS = (url) =>{
  let r = convertURLToPodcast(url);
  return DEBUG ? url : `${PROXY[r.protocol]}${r.domain}`;
}

export const cachedContent = (url) =>{
  let r = convertURLToPodcast(url);
  return DEBUG ? url : `${CACHED[r.protocol]}${r.domain}`;
}

export const cacheImage= (url) =>{
  let r = convertURLToPodcast(url);
  return DEBUG ? url : `${PROXY[r.protocol]}${r.domain}`;
}

export const getPodcasts = function(podcasts){
  return new Promise((acc,rej) => {
    Promise.all(podcasts.map(cast =>{
      let podcast = convertURLToPodcast(cast);
      let CORS_PROXY = PROXY[podcast.protocol];
      let found = sessionStorage.getItem(podcast.domain);
      if(found){
        return Promise.resolve(JSON.parse(found));
      }else{
        return new Promise((resolve,reject)=>{
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
        sessionStorage.setItem(rss.domain,JSON.stringify(rss))
      })
      acc(clean);
    })


  })
}

export const checkIfNewPodcastInURL = function() {
    if(!window && !window.location ) return DEFAULTCAST;

    let urlPodcast = new window.URL(window.location.href);
    let podcast = urlPodcast.searchParams.get("podcast");

    return convertURLToPodcast(podcast);
}

export const addNewPodcast = function(newPodcast,callback){
  removeCurrentPodcast.call(this);
  fillPodcastContent.call(this, newPodcast)
  .then(podcast => addPodcastToLibrary.call(this,podcast));
  callback && callback.call(this);

}

export const getPopularPodcasts = function(){
  return new Promise( function(acc,rej){
    fetchJ(`${SEARCH}/popular`)
    .then(data=>acc(data))
    .catch(err=>rej(err));
  })
}

export const getPodcastColor = (cast) => { return { backgroundColor:randomColor({seed:cast.title,luminosity:'dark'}) } }


//Events

// Ask for podcast URL.
export const askForPodcast = function(callback){
  let input = prompt('URL or Name of Podcast');
      if(!input) return;
      input = input.trim();
  try{
    (new URL(input)) && addNewPodcast.call(this,convertURLToPodcast(input),callback);
  }catch(err){ // Maybe search the string?
    console.log('error',err);
  }  
}
// Load current Selectedt Podcast into View
export const loadPodcastToView = function(ev){
    let podcast = ev && ev.currentTarget && ev.currentTarget.getAttribute('domain');
    if(this.podcasts.has(podcast)){
      let {title,image,description} = this.podcasts.get(podcast);
      this.setState({
        title,
        image,
        description,
        podcast
      })
    }
    fillPodcastContent.call(this,podcast)
    .then(()=>{
      this.setState({
        view:CASTVIEW
      });
    })
}
