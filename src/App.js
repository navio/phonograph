import React, { Component, Suspense } from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import { ThemeProvider } from "@material-ui/core/styles";
import theme, { switchHanlder } from "./Theme";
import audioqueue from "audioqueue";
import Typography from "@material-ui/core/Typography";
import PodcastHeader from "./podcast/PodcastHeader";

import loadingAnimation from '../public/loading.svg';
// import "babel-polyfill";

import {
  ROOT,
  LIBVIEW,
  PODCASTVIEW,
  DISCOVERVIEW,
  SETTINGSVIEW,
} from "./constants";

// App Components
// import Header from './app/Header';
import Footer from "./app/Footer";
import Notifications from "./app/Notifications";
// import MediaControl from "./app/MediaControl";
import { clearNotification, addNotification } from "./engine/notifications";

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

// Code Module
const Discover = React.lazy(async () => await import("./podcast/Discover"));
const Library = React.lazy(async () => await import("./podcast/Library"));
const Settings = React.lazy(async () => await import("./podcast/Settings"));
const MediaControl = React.lazy(async () => await import("./app/MediaControl"));
const EpisodeList = React.lazy(
  async () => await import("./podcast/EpisodeList")
);


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
      created: null,
      loading: false,
      podcasts: [],
      theme: true,
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

    this.switchHanlder = switchHanlder.bind(this);

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
    const finalTheme = this.state.theme === theme.os ? theme.dark : theme.light;
    const episode = this.episodes.get(this.state.episode);

    const Loading = (props) => (
      <Typography
        align="center"
        style={{ display: "block", paddintTop: "40%" }}
      >
        <img src={loadingAnimation} width="4rem" />
      </Typography>
    );

    return (
      <ThemeProvider theme={finalTheme}>
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
            path={[LIBVIEW, ROOT]}
            render={({ history }) => (
              <Suspense fallback={<Loading />}>
                <Library
                  addPodcastHandler={this.navigateTo(DISCOVERVIEW)} //{this.askForPodcast}
                  actionAfterSelectPodcast={this.navigateTo(PODCASTVIEW)}
                />
              </Suspense>
            )}
          />

          <Route
            path={PODCASTVIEW}
            render={() =>
              this.state.title ? (
                <>
                  <Suspense fallback={<Loading>Header</Loading>}>
                    <PodcastHeader
                      inLibrary={isPodcastInLibrary.bind(this)}
                      savePodcastToLibrary={saveToLibrary.bind(this)}
                      removePodcast={removePodcastFromLibrary.bind(this)}
                    />
                  </Suspense>
                  <Suspense fallback={<Loading>Loading</Loading>}>
                    <EpisodeList
                      episodes={this.state.items}
                      handler={this.playButton.bind(this)}
                      status={this.state.status}
                      playing={this.state.playing}
                    />
                  </Suspense>
                </>
              ) : (
                <Redirect to={LIBVIEW} />
              )
            }
          />

          <Route
            exact
            path={DISCOVERVIEW}
            render={({ history }) => (
              <Suspense fallback={<Loading />}>
                <Discover
                  addPodcastHandler={loadaNewPodcast.bind(this)}
                  actionAfterClick={this.navigateTo(PODCASTVIEW)}
                  notificaions={this.addNotification}
                />
              </Suspense>
            )}
          />

          <Route
            path={SETTINGSVIEW}
            render={() => (
              <Suspense fallback={<Loading />}>
                <Settings
                  themeSwitcher={this.switchHanlder}
                  removePodcast={removePodcastFromLibrary.bind(this)}
                  podcasts={this.state.podcasts}
                />
              </Suspense>
            )}
          />

          <Suspense fallback={<Loading />}>
            <MediaControl
              toCurrentPodcast={this.navigateTo(PODCASTVIEW)}
              player={this.refs.player}
              handler={this.playButton}
              forward={this.forward30Seconds}
              rewind={this.rewind10Seconds}
              seek={this.seek}
            />
          </Suspense>

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
