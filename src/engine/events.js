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
    dispatch({type:'audioUpdate', payload: { loading: "loaded" }});
  };
  
  const completedPlaying = async function (ev) {
      dispatch({type:'audioCompleted', payload: {
        episode: null,
        author: null,
        playing: null,
        status: null,
        episodeInfo:null,
      }});

  };
  
  const eventEcho = function (ev) {
    if (!process.env.NODE_ENV || process.env.NODE_ENV === "development")
      console.log(ev.type, player.buffered, ev);
  };
  
  const playTick = function (ev) {

    dispatch({ type: 'playingStatus', status: "playing" });
    tick = setInterval(() => {
      let loaded = player.buffered.length
        ? (100 * player.buffered.end(0)) / player.duration
        : 0;
      dispatch({type:'audioUpdate',payload: {
        loaded,
        played: (100 * player.currentTime) / player.duration,
        currentTime: player.currentTime,
        duration: player.duration,
      }});
    }, 500);
  };


  const progress = function (ev) {
    let loaded = player.buffered.length
      ? (100 * player.buffered.end(0)) / player.duration
      : 100;
      dispatch({type:'audioUpdate', payload: {loaded} })
  };
  
  const pauseTick = function () {
    clearInterval(tick);
    dispatch({ type: 'audioUpdate', payload: { status: "pause", refresh: Date.now() } });
  };
  
  const stopTick = function (ev) {
    clearInterval(tick);
  };

  // player.addEventListener('loadstart',this.loading.bind(this));
  player.addEventListener("loadeddata", eventEcho);
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
