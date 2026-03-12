import React, { useRef, Suspense, useEffect } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { Route, Redirect, useHistory, Switch } from "react-router-dom";

import createAppTheme, { prefersDark } from "./theme";
import LoadingSVG from "./core/Loading";
import Drawer from "./core/Drawer";
import { useAppStore } from "./store/appStore";
import {
  ROOT,
  LIBVIEW,
  PLAYLIST,
  PODCASTVIEW,
  DISCOVERVIEW,
  SETTINGSVIEW,
  DOWNLOADVIEW,
} from "./constants";
import playerFunctions from "./engine/player";
import { getPodcastEngine, checkIfNewPodcastInURL } from "./engine";
import attachEvents from "./engine/events";
import WorkerClass from "./serviceworker/worker?worker";
import { AppContextValue } from "./types/app";

export const AppContext = React.createContext<AppContextValue | null>(null);
export const Consumer = AppContext.Consumer;

const debug = !process.env.NODE_ENV || process.env.NODE_ENV === "development";
const playerProxy = debug ? "" : "";

const Discover = React.lazy(async () => await import("./podcast/Discovery"));
const Library = React.lazy(async () => await import("./podcast/Library"));
const Settings = React.lazy(async () => await import("./podcast/Settings"));
const Playlist = React.lazy(async () => await import("./core/Playlist"));
const MediaControl = React.lazy(async () => await import("./core/MediaControl"));
const PodcastView = React.lazy(async () => await import("./podcast/PodcastView"));
const Footer = React.lazy(async () => await import("./core/Footer"));
const DesktopDownload = React.lazy(async () => await import("./core/DesktopDownload"));

const Loading = () => (
  <div style={{ margin: "0 auto", display: "block", paddingTop: "40%", textAlign: "center" }}>
    <LoadingSVG />
  </div>
);

const Underground = () => <div style={{ display: "block", height: "5.35rem" }}>.</div>;

const worker = new WorkerClass();

const App: React.FC = () => {
  const player = useRef<HTMLAudioElement | null>(null);

  const state = useAppStore((s) => s.state);
  const dispatch = useAppStore((s) => s.dispatch);

  const mediaFunctions = playerFunctions(player, dispatch, state);
  const history = useHistory();

  const loadPodcast = (podcast: string, cb: () => void) => {
    dispatch({ type: "loadPodcast", payload: podcast });
    cb();
  };

  const { podcast: newPodcast, shouldInit } = checkIfNewPodcastInURL();

  if (newPodcast) {
    loadPodcast(newPodcast, () => history.push(PODCASTVIEW));
  }

  const engine = getPodcastEngine(Boolean(shouldInit));

  useEffect(() => {
    worker.postMessage({ action: "update" });
  }, []);

  useEffect(() => {
    if (!player.current) return;
    const cleanup = attachEvents(player.current, dispatch, state);
    window.player = player.current;
    player.current.currentTime = Number(state.currentTime) || 0;
    return cleanup;
  }, []);

  useEffect(() => localStorage.setItem("state", JSON.stringify(state)), [state]);

  const title = state.episodeInfo?.title || "";

  const systemPrefersDark = prefersDark();
  const resolvedMode = state.theme === "light" ? "light" : state.theme === "dark" ? "dark" : systemPrefersDark ? "dark" : "light";
  const resolvedName = (state.themeName as string) || "nord";
  const finalTheme = createAppTheme(resolvedName as any, resolvedMode as any);

  return (
    <ThemeProvider theme={finalTheme}>
      <AppContext.Provider
        value={{
          state,
          dispatch,
          engine,
          debug,
          worker,
          player: player.current,
          playerRef: player,
        }}
      >
        <CssBaseline />

        <Suspense fallback={<></>}>
          {player.current && (
            <MediaControl
              player={player.current}
              handler={mediaFunctions.playButton}
              forward={mediaFunctions.forward30Seconds}
              rewind={mediaFunctions.rewind10Seconds}
              seek={mediaFunctions.seek}
            />
          )}
        </Suspense>

        <Switch>
          <Route
            exact
            path={[LIBVIEW]}
            render={({ history }) => (
              <Suspense fallback={<Loading />}>
                <Library
                  addPodcastHandler={() => history.push(DISCOVERVIEW)}
                  actionAfterSelectPodcast={() => history.push(PODCASTVIEW)}
                />
              </Suspense>
            )}
          />

          <Route
            path={[PODCASTVIEW, `${PODCASTVIEW}/:podcastname`]}
            render={({ history }) => (
              <Suspense fallback={<Loading />}>
                <PodcastView history={history} />
              </Suspense>
            )}
          />

          <Route
            path={PLAYLIST}
            exact
            render={() => (
              <Suspense fallback={<Loading />}>
                <Playlist />
              </Suspense>
            )}
          />

          {/*
            If the user lands on the root path, decide the initial view synchronously
            from the initial app state (derived from localStorage). This avoids flicker
            by performing the decision during render rather than in an effect.
          */}
          <Route
            exact
            path={ROOT}
            render={() => {
              const hasSaved = state && state.podcasts && state.podcasts.length > 0;
              return <Redirect to={hasSaved ? LIBVIEW : DISCOVERVIEW} />;
            }}
          />

          <Route
            exact
            path={[DISCOVERVIEW]}
            render={({ history }) => (
              <Suspense fallback={<Loading />}>
                <Discover
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
                <Settings />
              </Suspense>
            )}
          />

          <Route
            path={[DOWNLOADVIEW, `${DOWNLOADVIEW}/mac`]}
            exact
            render={() => (
              <Suspense fallback={<Loading />}>
                <DesktopDownload />
              </Suspense>
            )}
          />

          <Route>
            <Redirect to={DISCOVERVIEW} />
          </Route>
        </Switch>

        {state.episodeInfo && <Underground />}

        <Suspense fallback={<Loading />}>
          <Footer />
        </Suspense>

        <audio
          preload="auto"
          autoPlay={state.status !== "paused"}
          ref={player}
          title={title}
          src={playerProxy + state.media}
        />
        <Drawer />
      </AppContext.Provider>
    </ThemeProvider>
  );
};

export default App;
