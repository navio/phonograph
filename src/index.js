import React, { Component } from 'react';
import { render } from 'react-dom';
import EpisodeList from "./EpisodeList";
let Parser = new window.RSSParser();

const CORS_PROXY = "/rss/"; 
const DEFAULTCAST = "www.npr.org/rss/podcast.php?id=510289";

class App extends Component {
  constructor() {
    super();
    this.state = {
      playing: null,
      items: null,
      episode: null,
      author: null,
      status: null
    };
    this.episodes = new Map();
  }

  clickHandler(ev) {
    let guid = ev.currentTarget.getAttribute('data-guid');
    let episode = this.episodes.get(guid);

    if (this.state.playing === guid) {
      if(this.state.status === 'pause'){
        this.refs.player.play();
        this.setState({ status: 'playing' });
      }else{
        this.setState({ status: 'pause' });
        this.refs.player.pause();
      }
    } else {
      this.refs.player.setAttribute("src", episode.enclosure.url);
      this.setState({
        episode: episode.title,
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
    if (!found) {
      Parser.parseURL(CORS_PROXY + podcast)
        .then((RSS) => {
          this.setState({ items: RSS.items });
          this.loadEpisodes(RSS.items);
          window.localStorage.setItem(podcast, JSON.stringify(RSS));
        });
      this.episodes.clear();
    } else {
      let content = JSON.parse(found);
      this.setState({ items: content.items });
      this.loadEpisodes(content.items);
      Parser.parseURL(CORS_PROXY + podcast) //Background.
        .then((RSS) => {
          this.setState({ items: RSS.items });
          window.localStorage.setItem(podcast, JSON.stringify(RSS));
        });
    }
  }

  checkIfNewPodcast() {
    let urlString = window.location.href;
    let urlPodcast = new window.URL(urlString);
    let podcast = urlPodcast.searchParams.get("podcast");
    return podcast;
  }

  componentDidMount() {
    let podcast = this.checkIfNewPodcast() || DEFAULTCAST;
    let found = window.localStorage.getItem(podcast);
    this.fillPodcastContent.call(this, found, podcast);
    this.refs.player.addEventListener('ended', function () {
      this.setState({
        episode: null,
        author: null,
        playing: null
      });
    });
  }

  toHumans(time) {
    return Math.floor(1 * time / 60) + ':' + (1 * time % 60);
  }

  render() {
    return (
      <div>
       {this.state.status && <div>Playing: {this.state.episode} by {this.state.author}</div>}
        <EpisodeList episodes={this.state.items}
        handler={this.clickHandler.bind(this)} 
        status={this.state.status}
        playing={this.state.playing}
        />
        <audio autoPlay="true" ref="player" />
      </div>
    );
  }
}

render(<App />, document.getElementById('root'));
