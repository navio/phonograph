import React, { Component } from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import { ThemeProvider } from "@material-ui/core/styles";
import theme from "./Theme";
import audioqueue from "audioqueue";
// import "babel-polyfill";

import { LIBVIEW, PODCASTVIEW, DISCOVERVIEW, SETTINGSVIEW } from "./constants";

// App Components
// import Header from './app/Header';
import Footer from "./app/Footer";
import Notifications from "./app/Notifications";
import MediaControl from "./app/MediaControl";
import { clearNotification, addNotification } from "./engine/notifications";

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
  navigateTo,
} from "./engine/player";

// Podcast Engine
import {
  checkIfNewPodcastInURL,
  loadPodcastToView,
  initializeLibrary,
  loadaNewPodcast,
  askForPodcast,
  isPodcastInLibrary,
  removePodcastFromLibrary,
  saveToLibrary,
} from "./engine/podcast";

import attachEvents from "./engine/events";

// Router
import { withRouter } from "react-router";
import { Route, Redirect } from "react-router-dom";

const AppContext = React.createContext();

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
      podcasts: [],
    };

    this.episodes = new Map();
    // this.podcasts = new Map();
    this.navigateTo = navigateTo.bind(this);

    this.forward30Seconds = forward30Seconds.bind(this);
    this.rewind10Seconds = rewind10Seconds.bind(this);
    this.seek = seek.bind(this);
    this.playButton = playButton.bind(this);
    this.loadPodcastToView = loadPodcastToView.bind(this);
    this.askForPodcast = askForPodcast.bind(this);

    this.clearNotification = clearNotification.bind(this);
    this.addNotification = addNotification.bind(this);

    // Mode
    const newPodcast = checkIfNewPodcastInURL.call(this);
    newPodcast &&
      loadaNewPodcast.call(this, newPodcast, this.navigateTo(PODCASTVIEW));
  }

  componentDidMount() {
    // Player
    const player = new audioqueue([], { audioObject: this.refs.player });
    attachEvents.call(this, player);

    // Podcasts
    initializeLibrary.call(this);

    // Debug
    window.player = player;
    window.notification = this.addNotification;
  }

  render() {
    const episode = this.episodes.get(this.state.episode);
    return (
      <ThemeProvider theme={theme}>
        <AppContext.Provider
          value={{ state: this.state, global: this, episode: episode }}
        >
          <CssBaseline />
          <Notifications
            show={!!this.state.showNotification}
            callback={this.clearNotification}
            {...this.state.notification}
          />

          <Route
            exact
            path={LIBVIEW}
            render={({ history }) => (
              <PodcastGrid
                addPodcastHandler={this.navigateTo(DISCOVERVIEW)} //{this.askForPodcast}
                actionAfterSelectPodcast={this.navigateTo(PODCASTVIEW)}
              />
            )}
          />

          <Route
            path={PODCASTVIEW}
            render={() =>
              this.state.title ? (
                <div>
                  <PodcastHeader
                    inLibrary={isPodcastInLibrary.bind(this)}
                    savePodcastToLibrary={saveToLibrary.bind(this)}
                    removePodcast={removePodcastFromLibrary.bind(this)}
                  />
                  <EpisodeList
                    episodes={this.state.items}
                    handler={this.playButton.bind(this)}
                    status={this.state.status}
                    playing={this.state.playing}
                  />
                </div>
              ) : (
                <Redirect to={LIBVIEW} />
              )
            }
          />

          <Route
            path={DISCOVERVIEW}
            render={({ history }) => (
              <Discover
                addPodcastHandler={loadaNewPodcast.bind(this)}
                actionAfterClick={this.navigateTo(PODCASTVIEW)}
                notificaions={this.addNotification}
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
            player={this.refs.player}
            handler={this.playButton}
            forward={this.forward30Seconds}
            rewind={this.rewind10Seconds}
            seek={this.seek}
          />

          <Footer path={this.props.location.pathname} />

          <audio
            autoPlay={true}
            ref="player"
            preload="auto"
            title={(episode && episode.title) || ""}
            poster={(episode && episode.itunes && episode.itunes.image) || ""}
          />
        </AppContext.Provider>
      </ThemeProvider>
    );
  }
}

export default withRouter(App);
export const Consumer = AppContext.Consumer;
