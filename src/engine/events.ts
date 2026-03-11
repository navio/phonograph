// const updateStatus = function(){
//   let player = this.refs.player;
//   let loaded = (player.buffered.length) ? (100 * player.buffered.end(0) / player.duration) : 0;
//   this.setState({ loaded,
//     played: (100 * player.currentTime / player.duration),
//     currentTime: player.currentTime,
//     duration: player.duration });
// }

import { AppAction, AppState } from "../types/app";
import { getSettingsForCurrentPodcast } from "../podcast/PodcastView/settingsStorage";

export default function attachEvents(
  player: HTMLAudioElement,
  dispatch: (action: AppAction) => void,
  state: AppState
) {
  // Track the last source for which we applied per-podcast settings so we
  // only apply skip-intro / default-speed once per episode, not on every
  // play/resume event.
  let lastAppliedSrc = "";
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
    // ---- Per-podcast settings: skip intro & default speed ----
    const isNewSource = player.src !== lastAppliedSrc;
    const podSettings = getSettingsForCurrentPodcast();

    if (isNewSource && podSettings) {
      lastAppliedSrc = player.src;

      // Apply default playback speed for this podcast
      if (podSettings.defaultSpeed && podSettings.defaultSpeed !== 1.0) {
        player.playbackRate = podSettings.defaultSpeed;
      }

      // Skip intro: only when the episode just started (currentTime near 0)
      if (podSettings.skipIntro > 0 && player.currentTime < 2) {
        player.currentTime = podSettings.skipIntro * 60;
      }
    }

    dispatch({ type: "playingStatus", status: "playing" });
    tick = setInterval(() => {
      const loaded = player.buffered.length
        ? (100 * player.buffered.end(0)) / player.duration
        : 0;

      // ---- Per-podcast settings: skip outro ----
      if (
        podSettings &&
        podSettings.skipOutro > 0 &&
        player.duration > 0 &&
        !isNaN(player.duration)
      ) {
        const skipOutroSec = podSettings.skipOutro * 60;
        const remaining = player.duration - player.currentTime;
        // Trigger completion when remaining time falls within the skip
        // window, but only if we've played past the intro zone to avoid
        // false positives on very short episodes or during seeks.
        if (remaining > 0 && remaining <= skipOutroSec && player.currentTime > skipOutroSec) {
          if (tick) clearInterval(tick);
          dispatch({ type: "audioCompleted" });
          return;
        }
      }

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
