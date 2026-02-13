// const updateStatus = function(){
//   let player = this.refs.player;
//   let loaded = (player.buffered.length) ? (100 * player.buffered.end(0) / player.duration) : 0;
//   this.setState({ loaded,
//     played: (100 * player.currentTime / player.duration),
//     currentTime: player.currentTime,
//     duration: player.duration });
// }

import { AppAction, AppState } from "../types/app";

export default function attachEvents(
  player: HTMLAudioElement,
  dispatch: (action: AppAction) => void,
  state: AppState
) {
  if ("mediaSession" in navigator) {
    navigator.mediaSession.setActionHandler("play", () => {
      player
        .play()
        .then(() => dispatch({ type: "playingStatus", status: "playing" }))
        .catch(() => {});
    });
    navigator.mediaSession.setActionHandler("pause", () => {
      player.pause();
      dispatch({ type: "playingStatus", status: "paused" });
    });
  }

  let tick: ReturnType<typeof setInterval> | null = null;

  const completedLoading = () => {
    dispatch({ type: "audioUpdate", payload: { loading: true } });
  };

  const loadMedia = () => {};

  const completedPlaying = async () => {
    dispatch({ type: "audioCompleted" });
  };

  const eventEcho = (ev: Event) => {
    if (!process.env.NODE_ENV || process.env.NODE_ENV === "development")
      console.log(ev.type, player.buffered, ev);
  };

  const playTick = () => {
    dispatch({ type: "playingStatus", status: "playing" });
    tick = setInterval(() => {
      const loaded = player.buffered.length
        ? (100 * player.buffered.end(0)) / player.duration
        : 0;
      dispatch({
        type: "audioUpdate",
        payload: {
          loaded,
          played: (100 * player.currentTime) / player.duration,
          currentTime: player.currentTime,
          duration: player.duration,
        },
      });
    }, 500);
  };

  const progress = () => {
    const loaded = player.buffered.length
      ? (100 * player.buffered.end(0)) / player.duration
      : 100;
    dispatch({ type: "audioUpdate", payload: { loaded } });
  };

  const pauseTick = () => {
    if (tick) clearInterval(tick);
    dispatch({ type: "audioUpdate", payload: { status: "paused", refresh: Date.now() } });
  };

  const stopTick = () => {
    if (tick) clearInterval(tick);
  };

  player.addEventListener("loadeddata", loadMedia);
  player.addEventListener("progress", progress);
  player.addEventListener("canplaythrough", eventEcho);

  player.addEventListener("play", playTick);
  player.addEventListener("pause", pauseTick);
  player.addEventListener("abort", stopTick);

  player.addEventListener("canplay", completedLoading);
  player.addEventListener("ended", completedPlaying);

  return () => {
    player.removeEventListener("loadeddata", loadMedia);
    player.removeEventListener("progress", progress);
    player.removeEventListener("canplaythrough", eventEcho);
    player.removeEventListener("play", playTick);
    player.removeEventListener("pause", pauseTick);
    player.removeEventListener("abort", stopTick);
    player.removeEventListener("canplay", completedLoading);
    player.removeEventListener("ended", completedPlaying);
    if (tick) clearInterval(tick);
  };
}
