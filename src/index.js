import React, { Component } from 'react';
import EpisodeList from "./EpisodeList";
import PodcastHeader from './PodcastHeader';
import MediaControl from './MediaControl';
import Header from './Header';
import Footer from './Footer';
import CssBaseline from '@material-ui/core/CssBaseline';
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
      loaded: 0,

      author: null,
      status: null,
      title: '',
      description: '',
      image: null,
      link: null,
      loading:false
    };
    this.episodes = new Map();
    this.loading = this.loading.bind(this);
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
    console.log('ended-->')
    this.setState({
      episode: null,
      author: null,
      playing: null,
      status:null
    });
  }

  eventEcho(ev){
    console.log(ev.type,window.player.buffered,ev)
  }

  showBufferProgress(ev){
    // let buffered = ev.target.buffered.end(ev.target.buffered.length-1);
    // let duration = ev.target.duration;
    // let buffered_percentage = (buffered / duration) * 100;
    // console.log(buffered_percentage);
    // console.log(ev.target.buffered.end(0),ev.target.buffered)

  }

  loading() {
    let buffered = this.refs.player.buffered;
    
    if (buffered.length) {
      let loaded = 100 * buffered.end(0) / this.refs.player.duration;
      // played = 100 * audio.currentTime / audio.duration;
      this.setState({buffered:loaded.toFixed(2)});
      //console.log(loaded)
      // percentages[0].innerHTML = loaded.toFixed(2);
      // percentages[1].innerHTML = played.toFixed(2);
      
    }
    setTimeout(this.loading, 50);
  }

  playTick(ev){
    this.tick = setInterval(()=>{ 
      this.setState({currentTime:this.refs.player.currentTime, duration: this.refs.player.duration });
    },1000);
  }

  pauseTick(ev){
    clearInterval(this.tick);
  }

  attachEvents(player){
    // Initialization
    player.addEventListener('loadstart',this.loading.bind(this)); 
    player.addEventListener('loadeddata',this.eventEcho.bind(this)); 
    player.addEventListener('progress',this.showBufferProgress.bind(this));
    player.addEventListener('canplaythrough',this.eventEcho.bind(this));

    // User Events
    player.addEventListener('play',this.playTick.bind(this));
    player.addEventListener('pause',this.pauseTick.bind(this));
    
    // Media Events
    player.addEventListener('canplay',this.completedLoading.bind(this))
    player.addEventListener('ended', this.completedPlaying.bind(this));
  }

  componentDidMount() {
    let podcast = this.checkIfNewPodcast() || { domain: DEFAULTCAST , protocol:'https:'} ;
    this.fillPodcastContent.call(this, podcast);
    let player = this.refs.player;
    this.attachEvents.call(this,player);

    window.player = player;
  }

  render() {
    let episode = this.episodes.get(this.state.episode) || null;
    // episode && console.log(episode)
    return (
      <div><CssBaseline />
        <Header />
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
            totalTime={this.state.duration}
            currentTime={this.state.currentTime}
            playing={this.state.playing}
            handler={this.clickHandler.bind(this)}
            forward={this.forward30Seconds.bind(this)}
            rewind={this.rewind10Seconds.bind(this)}
            loading={this.state.loading}
            buffered={this.state.buffered}
          />

        {<EpisodeList 
          episodes={this.state.items}           
          handler={this.clickHandler.bind(this)}
          status={this.state.status}
          playing={this.state.playing} />}
        <Footer />
        <audio autoPlay="true" 
                ref="player" 
                title={(episode && episode.title) ||''} 
                poster={(episode && episode.itunes && episode.itunes.image) ||''} />
        
      </div>
    );
  }
}

render(<App />, document.getElementById('root'));