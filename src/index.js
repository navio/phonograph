import React, { Component } from 'react';
import { render } from 'react-dom';
import CssBaseline from '@material-ui/core/CssBaseline';

import { LIBVIEW, CASTVIEW } from './constants';

// App Components
// import Header from './app/Header';
import Footer from './app/Footer';
import MediaControl from './app/MediaControl';

// Podcast Views
import EpisodeList from "./podcast/EpisodeList";
import PodcastHeader from './podcast/PodcastHeader';
import PodcastGrid from './podcast/PodcastGrid';

// Engine - Player Interactions
import { forward30Seconds, rewind10Seconds, playButton, seek } from './engine/player';

// Podcast Engine 
import {  checkIfNewPodcastInURL, 
          loadPodcastToView, 
          buildLibrary, 
          fillPodcastContent,
          addPodcastToLibrary
        } from './engine/podcast';

import attachEvents from './engine/events'

// Router Views
import { viewAll, viewCurrenPodcast } from './engine/routes';

import { unregister } from './registerServiceWorker';


class App extends Component {

  constructor() {
    super();
    this.state = {
      view:LIBVIEW,
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
    this.podcasts = new Map();

    this.forward30Seconds = forward30Seconds.bind(this);
    this.rewind10Seconds = rewind10Seconds.bind(this);
    this.seek = seek.bind(this);
    this.playButton = playButton.bind(this);
    this.loadPodcastToView = loadPodcastToView.bind(this);

  }

  componentDidMount() {
    
    // Player
    let player = this.refs.player;
    attachEvents.call(this,player);

    // Podcasts
    buildLibrary.call(this);
    let podcasts = [...this.podcasts.values()];
    this.setState({podcasts});
    
    // Mode
    let newPodcast = checkIfNewPodcastInURL.call(this);
    if(newPodcast){
      fillPodcastContent.call(this, newPodcast)
      .then(podcast => addPodcastToLibrary.call(this,podcast));
      viewCurrenPodcast.call(this);
    }

    // Debug
    window.player = player;
  }

  render() {
    let episode = this.episodes.get(this.state.episode) || null;
    let view = this.state.view && this.state.view;
    return (
      <div>
        <CssBaseline />
        
        { view === LIBVIEW && 
          <div>
            <PodcastGrid casts={this.state.podcasts} selectPodcast={this.loadPodcastToView} />
          </div>
        }

        { view === CASTVIEW && 
          <div>
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
              playing={this.state.playing} 
            /> 
          </div>
        }

        <MediaControl 
            toCurrentPodcast={viewCurrenPodcast.bind(this)}
            episode={episode} 
            player={this.refs.player}
            status={this.state.status}
            totalTime={this.state.duration}
            currentTime={this.state.currentTime}
            playing={this.state.playing}
            handler={this.playButton}
            forward={this.forward30Seconds}
            rewind={this.rewind10Seconds}
            loading={this.state.loading}
            loaded={this.state.loaded}
            played={this.state.played}
            seek={this.seek}
        />

        <Footer toPodcasts={viewAll.bind(this)} />

        <audio autoPlay="true" 
                ref="player" 
                preload="auto" 
                title={(episode && episode.title) ||''} 
                poster={(episode && episode.itunes && episode.itunes.image) ||''} 
        />
      </div>
    );
  }
}

render(<App />, document.getElementById('root'));
unregister();