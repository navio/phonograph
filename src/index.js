import React, { Component } from 'react';
import { render } from 'react-dom';
import CssBaseline from '@material-ui/core/CssBaseline';

import MediaControl from './app/MediaControl';
import Header from './app/Header';
import Footer from './app/Footer';

// Podcast
import EpisodeList from "./podcast/EpisodeList";
import PodcastHeader from './podcast/PodcastHeader';
// Engine
import {forward30Seconds, rewind10Seconds, playButton} from './engine/player';
import {fillPodcastContent,checkIfNewPodcast} from './engine/podcast';
import attachEvents from './engine/events'


class App extends Component {

  constructor() {
    super();
    this.state = {
      playing: null,
      items: null,
      episode: null,
      loaded: 0,
      played: 0,

      author: null,
      status: null,
      title: '',
      description: '',
      image: null,
      link: null,
      loading:false
    };

    this.episodes = new Map();

    this.forward30Seconds = forward30Seconds.bind(this);
    this.rewind10Seconds = rewind10Seconds.bind(this);
    this.playButton = playButton.bind(this);

  }


  componentDidMount() {
    let podcast = checkIfNewPodcast.call(this);
    let player = this.refs.player;

    fillPodcastContent.call(this, podcast);
    attachEvents.call(this,player);
    
    window.player = player;
  }

  render() {
    let episode = this.episodes.get(this.state.episode) || null;

    return (
      <div>
        <CssBaseline />
        <Header />
        
        <PodcastHeader
          title={this.state.title}
          image={this.state.image}
          description={this.state.description}
          episode={episode}  
          />
        <EpisodeList 
          episodes={this.state.items}           
          handler={this.playButton.bind(this)}
          status={this.state.status}
          playing={this.state.playing} />

        <MediaControl 
            episode={episode} 
            player={this.refs.player}
            status={this.state.status}
            totalTime={this.state.duration}
            currentTime={this.state.currentTime}
            playing={this.state.playing}
            handler={this.playButton.bind(this)}
            forward={this.forward30Seconds.bind(this)}
            rewind={this.rewind10Seconds.bind(this)}
            loading={this.state.loading}
            loaded={this.state.loaded}
            played={this.state.played}
          />
        <Footer />
        <audio autoPlay="true" 
                ref="player" 
                preload="auto" 
                title={(episode && episode.title) ||''} 
                poster={(episode && episode.itunes && episode.itunes.image) ||''} />
        
      </div>
    );
  }
}

render(<App />, document.getElementById('root'));