import React, { Component } from 'react';
import EpisodeList from "./EpisodeList";
import PodcastHeader from './PodcastHeader';
import MediaControl from './MediaControl';
import { render } from 'react-dom';

const Parser = new window.RSSParser();
let PROXY = {'https:':'/rss/','http:':'/rss-less/'};
if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
  PROXY = {'https:':'https://cors-anywhere.herokuapp.com/','http:':'https://cors-anywhere.herokuapp.com/'};
}

const DEFAULTCAST = "www.npr.org/rss/podcast.php?id=510289";

export const clearText = (html) =>{
    let tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText;
}

class App extends Component {

  constructor() {
    super();
    this.state = {
      playing: null,
      items: null,
      episode: null,

      author: null,
      status: null,
      title: '',
      description: '',
      image: null,
      link: null,
      loading:false
    };
    this.episodes = new Map();
  }

  clickHandler(ev) {
    let guid = ev.currentTarget.getAttribute('data-guid');
    let episode = this.episodes.get(guid);

    if (this.state.playing === guid) {
      if (this.state.status === 'pause') {
        this.refs.player.play();
        this.setState({ status: 'playing' });
      } else {
        this.setState({ status: 'pause' });
        this.refs.player.pause();
      }

    } else {
      this.refs.player.setAttribute("src", episode.enclosure.url);
      this.refs.player.play();
      this.setState({
        episode: episode.guid,
        author: episode.itunes.author,
        playing: guid,
        status: 'playing'
      });
    }
  }

  forward30Seconds(ev){
    this.refs.player.currentTime += 30;
  }
  rewind10Seconds(ev){
    this.refs.player.currentTime -= 10;
  }

  loadEpisodes(RSS) {
    RSS.forEach(item => this.episodes.set(item.guid, item));
  }

  fillPodcastContent(podcast) {

    let CORS_PROXY = PROXY[podcast.protocol];
    let found = window.localStorage.getItem(podcast.domain);
    
    if (!found) {
      this.episodes.clear();
      Parser.parseURL(CORS_PROXY + podcast.domain)
        .then((RSS) => { 
          this.setState({ items: RSS.items.slice(0, 20) });
          this.loadEpisodes(RSS.items);
          window.localStorage.setItem(podcast.domain, JSON.stringify(RSS));
        });
    } else {
      let content = JSON.parse(found);
      this.setState({
        items: content.items.slice(0, 20),
        title: content.title,
        description: content.description,
        image: content.itunes.image,
        link: content.link
      });
      this.episodes.clear();
      this.loadEpisodes(content.items);
      Parser.parseURL(CORS_PROXY + podcast.domain) //Background.
        .then((RSS) => { 
          let newReading = JSON.stringify(RSS);
          if (newReading !== found) {
            console.log('Updated');
            window.localStorage.setItem(podcast.domain, JSON.stringify(RSS));
            this.setState({
              items: RSS.items.slice(0, 20)
            });
            this.episodes.clear();
            this.loadEpisodes(RSS.items);
          }
        });
    }
  }

  checkIfNewPodcast() {
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
    }catch(err){
      console.error('Invalid URL');
    }
  }

  completedLoading(ev){
    this.setState({loading:'loaded'});
  }

  completedPlaying(ev){
    this.setState({
      episode: null,
      author: null,
      playing: null,
      status:null
    });
  }

  componentDidMount() {
    let podcast = this.checkIfNewPodcast() || { domain: DEFAULTCAST , protocol:'https:'} ;
    this.fillPodcastContent.call(this, podcast);
    let player = this.refs.player;
    window.player = player;
    // player.addEventListener('loadeddata',this.startLoading.bind(this));
    player.addEventListener('canplay',this.completedLoading(this))
    player.addEventListener('ended', this.completedPlaying(this));
  }

  render() {
    let episode = this.episodes.get(this.state.episode) || null;
    // episode && console.log(episode)
    return (
      <div>
        <PodcastHeader
          title={this.state.title}
          image={this.state.image}
          description={this.state.description}
          episode={episode}  
          />

        <MediaControl 
            episode={episode} 
            player={this.refs.player}
            status={this.state.status}

            playing={this.state.playing}
            handler={this.clickHandler.bind(this)}
            forward={this.forward30Seconds.bind(this)}
            rewind={this.rewind10Seconds.bind(this)}
            loading={this.state.loading}
          />

        <EpisodeList 
          episodes={this.state.items}           
          handler={this.clickHandler.bind(this)}
          status={this.state.status}
          playing={this.state.playing} />

        <audio autoPlay="true" 
                ref="player" 
                title={(episode && episode.title) ||''} 
                poster={(episode && episode.itunes && episode.itunes.image) ||''} />
      </div>
    );
  }
}

render(<App />, document.getElementById('root'));