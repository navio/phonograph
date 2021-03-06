
export default (player, dispatch, state) => {
  
  if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler("seekbackward", () => {
      rewind10Seconds();
    });
    navigator.mediaSession.setActionHandler("seekforward", () => {
      forward30Seconds(); }
    )}

  const seek = function (ev, value) {
    const current = Math.floor((value * player.current.duration) / 100);
    player.current.currentTime = current;
    const loaded = player.current.buffered.length
      ? (100 * player.current.buffered.end(0)) / player.current.duration
      : 0;
      dispatch({type:'audioUpdate', payload: {
        loaded,
        currentTime: player.current.currentTime,
        duration: player.current.duration,
        played: (100 * player.current.currentTime) / player.current.duration,
    }});
  };
  
  const forward30Seconds = function () {
    player.current.currentTime += 30;
  
    const loaded = player.current.buffered.length
      ? (100 * player.current.buffered.end(0)) / player.current.duration
      : 0;
  
      dispatch({type:'audioUpdate',payload: {
        loaded,
        played: (100 * player.current.currentTime) / player.current.duration,
        currentTime: player.current.currentTime,
        duration: player.current.duration,
      }});
  };
  
  const rewind10Seconds = function () {
    player.current.currentTime -= 10;
    const loaded = player.current.buffered.length
      ? (100 * player.current.buffered.end(0)) / player.current.duration
      : 0;
      dispatch({type:'audioUpdate', payload: {
        loaded,
        played: (100 * player.current.currentTime) / player.current.duration,
        currentTime: player.current.currentTime,
        duration: player.current.duration,
    }});
  };

  const playButton = () => {
      if (state.status === "paused") {
        
        player.current
        .play()
        .then( _ => player.current.currentTime = state.currentTime );

        dispatch({ type: 'playingStatus', status: "playing" });
        player.current.currentTime = state.currentTime;
      } else {
        player.current.pause();
        dispatch({ type: 'audioUpdate', payload:{ status:"paused", currentTime: player.current.currentTime } });
      }
  };

  return {
    playButton,
    rewind10Seconds,
    forward30Seconds,
    seek
  }

};
