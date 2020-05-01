import { driveThruDNS } from "./podcast";
export const seek = function (ev, value) {
  let player = this.refs.player;
  let current = Math.floor((value * player.duration) / 100);
  player.currentTime = current;
  let loaded = player.buffered.length
    ? (100 * player.buffered.end(0)) / player.duration
    : 0;
  this.setState({
    loaded,
    currentTime: player.currentTime,
    duration: player.duration,
    played: (100 * player.currentTime) / player.duration,
  });
};
export const forward30Seconds = function () {
  let player = this.refs.player;
  player.currentTime += 30;

  let loaded = player.buffered.length
    ? (100 * player.buffered.end(0)) / player.duration
    : 0;

  this.setState({
    loaded,
    played: (100 * player.currentTime) / player.duration,
    currentTime: player.currentTime,
    duration: player.duration,
  });
};

export const rewind10Seconds = function () {
  let player = this.refs.player;
  player.currentTime -= 10;

  let loaded = player.buffered.length
    ? (100 * player.buffered.end(0)) / player.duration
    : 0;

  this.setState({
    loaded,
    played: (100 * player.currentTime) / player.duration,
    currentTime: player.currentTime,
    duration: player.duration,
  });
};

export const playButton = function (ev) {
  
  let guid = ev.currentTarget.getAttribute("data-guid");
  console.log(guid, ev.target, ev.currentTarget);
  let episode = this.episodes.get(guid);
  console.log('a',episode);
  if (this.state.playing === guid) {
    if (this.state.status === "pause") {
      this.refs.player.play();
      this.setState({ status: "playing" });
    } else {
      this.refs.player.pause();
      this.setState({ status: "pause" });
    }
  } else {
    this.refs.player.setAttribute("src", episode.enclosures[0].url);
    this.refs.player.play();
    this.setState({
      episode: episode.guid,
      author: episode.itunes_author,
      playing: guid,
      status: "playing",
    });
  }
};

export const navigateTo = function (path) {
  return () => this.props.history.push(path);
};
