import React, { Component } from 'react';
import EpisodeList from "./EpisodeList";
import PodcastHeader from './PodcastHeader';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import { render } from 'react-dom';

const Parser = new window.RSSParser();

const PROXY = {'https:':'/rss/','http:':'/rss-less/'};
//const PROXY = {'https:':'https://cors-anywhere.herokuapp.com/','http:':'https://cors-anywhere.herokuapp.com/'};

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
      link: null
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

  loadEpisodes(RSS) {
    RSS.forEach(item => this.episodes.set(item.guid, item));
  }

  fillPodcastContent(found, podcast) {
    let CORS_PROXY = PROXY[podcast.protocol];
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
      if(podcast){
        podcast = new URL(podcast);
        return podcast;
      }
    }catch(err){
      console.error('Invalid URL');
    }
  }

  componentDidMount() {
    let podcast = this.checkIfNewPodcast() ;
    let url = ( podcast && podcast.href && podcast.href.replace(/(^\w+:|^)\/\//, '') ) || DEFAULTCAST;
    let protocol = (podcast && podcast.protocol) || "https:";
    let domain = { domain:url, protocol };

    let found = window.localStorage.getItem(url);
    this.fillPodcastContent.call(this, found, domain);
    this.refs.player.addEventListener('ended', function () {
      this.setState({
        episode: null,
        author: null,
        playing: null
      });
    });
  }

  render() {
    let episode = this.episodes.get(this.state.episode) || null;
    return (
      <MuiThemeProvider><div>
        <PodcastHeader
          title={this.state.title}
          image={this.state.image}
          description={this.state.description} 
          episode={episode}
          />
        <EpisodeList episodes={this.state.items}
          handler={this.clickHandler.bind(this)}
          status={this.state.status}
          playing={this.state.playing}
        />
        <audio autoPlay="true" ref="player" />
      </div></MuiThemeProvider>
    );
  }
}

render(<App />, document.getElementById('root'));