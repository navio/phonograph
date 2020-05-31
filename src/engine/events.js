// const updateStatus = function(){
//   let player = this.refs.player;
//   let loaded = (player.buffered.length) ? (100 * player.buffered.end(0) / player.duration) : 0;
//   this.setState({ loaded,
//     played: (100 * player.currentTime / player.duration),
//     currentTime: player.currentTime,
//     duration: player.duration });
// }

export default function (player, dispatch, state) {
  console.log("attaching events");
  let tick = null;

  const completedLoading = function (ev) {
    dispatch({ type: 'audioUpdate', payload: { loading: "loaded" } });
  };

  const loadMeida = (ev) => {
  }

  const completedPlaying = async function (ev) {
    const { playlist } = state;

    if (playlist && playlist.length > 1) {
      
      const nextEpisode = playlist.shift();
      dispatch({
        type: 'audioCompleted', 
        payload: { ...nextEpisode, playlist }
      });

    } else {

      dispatch({
        type: 'audioCompleted', 
        payload: {
          episode: null,
          author: null,
          playing: null,
          status: null,
          episodeInfo: null,
          podcastImage: null,
          audioOrigin: null,
          media: null,
          played: null,
          currentTime: null
        }
      });
    }
  };

  const eventEcho = function (ev) {
    if (!process.env.NODE_ENV || process.env.NODE_ENV === "development")
      console.log(ev.type, player.buffered, ev);
  };

  const playTick = function (ev) {

    // if ('mediaSession' in navigator) {
    //   const { episodeInfo, podcastAuthor, podcastImage, title } = state;
    //   const { title: episodeTitle } = episodeInfo;
    //   console.log({
    //       title: episodeTitle,
    //       artist: podcastAuthor,
    //       album: title,
    //       artwork: [
    //         { src: podcastImage },
    //       ]
    //     } )
      
    //   navigator.mediaSession.metadata = new MediaMetadata({
    //     title: episodeTitle,
    //     artist: podcastAuthor,
    //     album: title,
    //     artwork: [
    //       { src: podcastImage },
    //     ]
    //   });
    }
    
    dispatch({ type: 'playingStatus', status: "playing" });
    tick = setInterval(() => {
      let loaded = player.buffered.length
        ? (100 * player.buffered.end(0)) / player.duration
        : 0;
      dispatch({
        type: 'audioUpdate', payload: {
          loaded,
          played: (100 * player.currentTime) / player.duration,
          currentTime: player.currentTime,
          duration: player.duration,
        }
      });
    }, 500);
  };


  const progress = function (ev) {
    let loaded = player.buffered.length
      ? (100 * player.buffered.end(0)) / player.duration
      : 100;
    dispatch({ type: 'audioUpdate', payload: { loaded } })
  };

  const pauseTick = function () {
    clearInterval(tick);
    dispatch({ type: 'audioUpdate', payload: { status: "pause", refresh: Date.now() } });
  };

  const stopTick = function (ev) {
    clearInterval(tick);
  };

  // player.addEventListener('loadstart',this.loading.bind(this));
  player.addEventListener("loadeddata", loadMeida);
  player.addEventListener("progress", progress);
  player.addEventListener("canplaythrough", eventEcho);

  // User Events
  player.addEventListener("play", playTick);
  player.addEventListener("pause", pauseTick);
  player.addEventListener("abort", stopTick);

  // Media Events
  player.addEventListener("canplay", completedLoading);
  player.addEventListener("ended", completedPlaying);
}
