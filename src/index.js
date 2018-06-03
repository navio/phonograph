import React, { Component } from 'react';
import { render } from 'react-dom';
import CssBaseline from '@material-ui/core/CssBaseline';

import MediaControl from './app/MediaControl';
import Header from './app/Header';
import Footer from './app/Footer';

// Podcast
import EpisodeList from "./podcast/EpisodeList";
import PodcastHeader from './podcast/PodcastHeader';
import {defaultCasts} from './podcast/podcast';
import PodcastGrid from './podcast/PodcastGrid';

// Engine
import {forward30Seconds, rewind10Seconds, playButton} from './engine/player';
import {fillPodcastContent,checkIfNewPodcast,loadPodcast} from './engine/podcast';
import attachEvents from './engine/events'
import {viewAll,viewCurrenPodcast} from './engine/routes';


class App extends Component {

  constructor() {
    super();
    this.state = {
      view:'all',
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
    this.playButton = playButton.bind(this);
    this.loadPodcast = loadPodcast.bind(this);

  }

  loadPodcast(podcast){
     fillPodcastContent.call(this, podcast);
  }

  componentDidMount() {
    //Player
    let player = this.refs.player;
    attachEvents.call(this,player);

    //Podcasts
    let podcasts = defaultCasts;
    this.setState({podcasts});

    // Mode
    let newPodcast = checkIfNewPodcast.call(this);
    if(newPodcast){
      loadPodcast.call(this,newPodcast);
    }else{ 
      podcasts.forEach(cast => this.podcasts.set(cast.domain, cast));
    }

    

    window.player = player;
  }

  render() {
    let episode = this.episodes.get(this.state.episode) || null;
    let view = this.state.view && this.state.view
    return (
      <div>
        <CssBaseline />
        
        {view === 'all' && <div>
          <Header />
          <PodcastGrid casts={this.state.podcasts} selectPodcast={this.loadPodcast} />
        </div>}

        {view === 'podcast' && <div>
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
          </div>}

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
          />

        
        <Footer toPodcasts={viewAll.bind(this)} />

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