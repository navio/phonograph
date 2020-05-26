import React, { useRef , Suspense, useReducer, useEffect } from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import { ThemeProvider } from "@material-ui/core/styles";
import theme from "./theme";
import { reducer, initialState } from "./reducer"
import audioqueue from "audioqueue";
import LoadingSVG from "./core/Loading";

// Router
import { Route, Redirect, useHistory, Switch } from "react-router-dom";

// Constants
import {
  ROOT,
  LIBVIEW,
  PODCASTVIEW,
  DISCOVERVIEW,
  SETTINGSVIEW,
} from "./constants";

// Engine - Player Interactions
import playerFunctions from "./engine/player";

// Podcast Engine
import {
  getPodcastEngine,
  checkIfNewPodcastInURL,
  initializeLibrary,
} from "./engine";

import attachEvents from "./engine/events";

export const AppContext = React.createContext();
export const Consumer = AppContext.Consumer;


// Code Module
const Discover = React.lazy(async () => await import("./podcast/Discovery"));
const Library = React.lazy(async () => await import("./podcast/Library"));
const Settings = React.lazy(async () => await import("./podcast/Settings"));
const MediaControl = React.lazy(async () => await import("./core/MediaControl"));
const PodcastView = React.lazy( async () => await import("./podcast/PodcastView"));
const Footer = React.lazy( async () => await import("./core/Footer"));

const Loading = () => (
  <div
    align="center"
    style={{ margin: '0 auto', display: "block", paddintTop: "40%" }}
  >
    <LoadingSVG />
  </div>
);

// Pausing for load or refresh
initialState['status'] = "pause";

const App = ({}) => {

    const player = useRef(null);

    const [state, dispatch] = useReducer(reducer,initialState);
    const mediaFunctions = playerFunctions(player, dispatch, state);
    const history = useHistory();

    const loadPodcast = (podcast, cb) => {
      dispatch({type:'loadPodcast', payload: podcast});
      cb()
    } 

    // Mode
    const {newPodcast, shouldInit } = checkIfNewPodcastInURL();

    if(newPodcast){
      loadPodcast(newPodcast, () => history.push(PODCASTVIEW));
    }

    const engine = getPodcastEngine(shouldInit);
    
    useEffect(() => {
      initializeLibrary(engine, dispatch);
    },[]);

    useEffect(
      () => { 
        if(player.current) {
          const playerequeue = new audioqueue([], {audioObject: player.current});
          // console.log('audioReady', player.current)
          attachEvents(playerequeue, dispatch, state)
          window.player = playerequeue;
          playerequeue.currentTime = Number(state.currentTime) || 0;
        }
      },[player.current]);

    useEffect( () => localStorage.setItem('state',JSON.stringify(state)) , [state] );

    const finalTheme = state.theme === theme.os ? theme.dark : theme.light;

    return (
      <ThemeProvider theme={finalTheme}>
        <AppContext.Provider value={{ state, dispatch, engine, player: player.current }} >
          <CssBaseline />

          <Suspense fallback={<Loading />}>
            { player.current && <MediaControl
              player={player.current}
              handler={mediaFunctions.playButton}
              forward={mediaFunctions.forward30Seconds}
              rewind={mediaFunctions.rewind10Seconds}
              seek={mediaFunctions.seek}
            /> }
          </Suspense>


           <Switch>
            <Route
              exact
              path={[LIBVIEW]}
              render={({history}) => { 
                return (
                <Suspense fallback={<Loading />}>
                  <Library
                    history={history}
                    addPodcastHandler={() => history.push(DISCOVERVIEW)} //{this.askForPodcast}
                    actionAfterSelectPodcast={() => history.push(PODCASTVIEW)}
                  />
                </Suspense>
              )}}
            /> 
            
            <Route
              path={[PODCASTVIEW, `${PODCASTVIEW}/:podcastname`]}
              render={({history}) => 
                    <Suspense fallback={<Loading />}>
                      <PodcastView history={history} />
                    </Suspense>
                 }
            />

            <Route
              exact
              path={[DISCOVERVIEW, ROOT]}
              render={({ history }) => (
                <Suspense fallback={<Loading />}>
                  <Discover
                    history={history}
                    addPodcastHandler={loadPodcast}
                    actionAfterClick={() => history.push(PODCASTVIEW)}
                  />
                </Suspense>
              )}
            />
    
            <Route
              path={SETTINGSVIEW}
              exact
              render={() => (
                <Suspense fallback={<Loading />}>
                  <Settings
                    podcasts={state.podcasts}
                  />
                </Suspense>
              )}
            />
            <Route>
              <Redirect to={DISCOVERVIEW} />
            </Route>
          </Switch>
          


          <Suspense fallback={<Loading />}>
            <Footer path={location.pathname} />
          </Suspense> 

          <audio
            autoPlay={state.status !== 'pause'}
            ref={player}
            preload="auto"
            title={ state.title || ""}
            src={state.media}
            poster={ state.podcastImage || "" }
          />
        </AppContext.Provider>
      </ThemeProvider>
    );
}

export default (App);

