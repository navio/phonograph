import React, { Component } from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
// import "babel-polyfill";

import { LIBVIEW, PODCASTVIEW, DISCOVERVIEW, SETTINGSVIEW } from "./constants";

// App Components
// import Header from './app/Header';
import Footer from "./app/Footer";
import MediaControl from "./app/MediaControl";
import Snackbar from '@material-ui/core/Snackbar';

// Podcast Views
import EpisodeList from "./podcast/EpisodeList";
import PodcastHeader from "./podcast/PodcastHeader";
import PodcastGrid from "./podcast/PodcastGrid";
import Discover from "./podcast/Discover";
import Settings from "./podcast/Settings";



// Engine - Player Interactions
import {
  forward30Seconds,
  rewind10Seconds,
  playButton,
  seek,
  navigateTo
} from "./engine/player";

// Podcast Engine
import {
  checkIfNewPodcastInURL,
  loadPodcastToView,
  initializeLibrary,
  addNewPodcast,
  askForPodcast,
  isPodcastInLibrary,
  removePodcastFromLibrary,
  saveToLibraryFromView
} from "./engine/podcast";

import attachEvents from "./engine/events";

// Router
import { Route, withRouter, Redirect } from "react-router-dom";



class App extends Component {
  constructor() {
    super();
    this.state = {
      playing: null,
      items: null,
      loaded: 0,
      played: 0,
      author: null,
      status: null,
      title: "",
      description: "",
      image: null,
      link: null,
      loading: false,
      podcasts:[]
    };

    this.episodes = new Map();
    this.podcasts = new Map();
    this.navigateTo = navigateTo.bind(this);

    this.forward30Seconds = forward30Seconds.bind(this);
    this.rewind10Seconds = rewind10Seconds.bind(this);
    this.seek = seek.bind(this);
    this.playButton = playButton.bind(this);
    this.loadPodcastToView = loadPodcastToView.bind(this);
    this.askForPodcast = askForPodcast.bind(this);
  }

  componentDidMount() {
    // Player
    let player = this.refs.player;
    attachEvents.call(this, player);

    // Podcasts
    initializeLibrary.call(this);
    
    // Mode
    let newPodcast = checkIfNewPodcastInURL.call(this);
        newPodcast && addNewPodcast.call(this,newPodcast,this.navigateTo(PODCASTVIEW))

    // Debug
    window.player = player;
  }


  render() {
    let episode = this.episodes.get(this.state.episode);
    return (
      <div>
        <CssBaseline />
        <Route
          exact
          path={LIBVIEW}
          render={({ history }) => (
            <PodcastGrid
              podcasts={this.state.podcasts}
              selectPodcast={this.loadPodcastToView}
              addPodcastHandler={this.navigateTo(DISCOVERVIEW)} //{this.askForPodcast}
              actionAfterSelectPodcast={this.navigateTo(PODCASTVIEW)}
            />
          )}
        />

        <Route
          path={PODCASTVIEW}
          render={() => (
            this.state.title ?<div>
              <PodcastHeader
                title={this.state.title}
                image={this.state.image}
                description={this.state.description}
                inLibrary={isPodcastInLibrary.bind(this)}
                savePodcastToLibrary={saveToLibraryFromView.bind(this)}
                removePodcast={removePodcastFromLibrary.bind(this)}
              />
              <EpisodeList
                episodes={this.state.items}
                handler={this.playButton.bind(this)}
                status={this.state.status}
                playing={this.state.playing}
              />
            </div>:<Redirect to={LIBVIEW} />
          )}
        />

        <Route
          path={DISCOVERVIEW}
          render={({ history }) => (
            <Discover
              addPodcastHandler={addNewPodcast.bind(this)}
              actionAfterClick={this.navigateTo(PODCASTVIEW)}
            />
          )}
        />

        <Route
          path={SETTINGSVIEW}
          render={() => (
            <Settings
              removePodcast={removePodcastFromLibrary.bind(this)}
              podcasts={this.state.podcasts}
            />
          )}
        />

        <MediaControl
          toCurrentPodcast={this.navigateTo(PODCASTVIEW)}
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

        <Footer path={this.props.location.pathname} />

        <audio
          autoPlay="true"
          ref="player"
          preload="auto"
          title={(episode && episode.title) || ""}
          poster={(episode && episode.itunes && episode.itunes.image) || ""}
        />
      </div>
    );
  }
}

export default withRouter(App);
