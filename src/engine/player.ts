import { RefObject } from "react";
import { AppAction, AppState, PlayerFunctions } from "../types/app";

const noop = () => {};

export default (
  player: RefObject<HTMLAudioElement>,
  dispatch: (action: AppAction) => void,
  state: AppState
): PlayerFunctions => {
  const audio = player.current;

  if (!audio) {
    return {
      playButton: noop,
      rewind10Seconds: noop,
      forward30Seconds: noop,
      seek: noop,
    };
  }

  const seek = (_ev: Event, value: number | number[]) => {
    const sliderValue = Array.isArray(value) ? value[0] : value;
    const current = Math.floor((sliderValue * audio.duration) / 100);
    audio.currentTime = current;
    const loaded = audio.buffered.length
      ? (100 * audio.buffered.end(0)) / audio.duration
      : 0;
    dispatch({
      type: "audioUpdate",
      payload: {
        loaded,
        currentTime: audio.currentTime,
        duration: audio.duration,
        played: (100 * audio.currentTime) / audio.duration,
      },
    });
  };

  const forward30Seconds = () => {
    audio.currentTime += 30;

    const loaded = audio.buffered.length
      ? (100 * audio.buffered.end(0)) / audio.duration
      : 0;

    dispatch({
      type: "audioUpdate",
      payload: {
        loaded,
        played: (100 * audio.currentTime) / audio.duration,
        currentTime: audio.currentTime,
        duration: audio.duration,
      },
    });
  };

  const rewind10Seconds = () => {
    audio.currentTime -= 10;
    const loaded = audio.buffered.length
      ? (100 * audio.buffered.end(0)) / audio.duration
      : 0;
    dispatch({
      type: "audioUpdate",
      payload: {
        loaded,
        played: (100 * audio.currentTime) / audio.duration,
        currentTime: audio.currentTime,
        duration: audio.duration,
      },
    });
  };

  const playButton = () => {
    if (state.status === "paused") {
      audio
        .play()
        .then(() => {
          if (typeof state.currentTime === "number") {
            audio.currentTime = state.currentTime;
          }
        })
        .catch(() => {});

      dispatch({ type: "playingStatus", status: "playing" });
      if (typeof state.currentTime === "number") {
        audio.currentTime = state.currentTime;
      }
    } else {
      audio.pause();
      dispatch({
        type: "audioUpdate",
        payload: { status: "paused", currentTime: audio.currentTime },
      });
    }
  };

  if ("mediaSession" in navigator) {
    navigator.mediaSession.setActionHandler("seekbackward", () => {
      rewind10Seconds();
    });
    navigator.mediaSession.setActionHandler("seekforward", () => {
      forward30Seconds();
    });
  }

  return {
    playButton,
    rewind10Seconds,
    forward30Seconds,
    seek,
  };
};
