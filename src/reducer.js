import PS from 'podcastsuite';
const db = PS.createDatabase('history','podcasts');

export const completeEpisodeHistory = async (feed,episode,fb) => {
 if(feed && episode) {
   console.log('marked',episode);
    const inMemory = await db.get(feed);

    const current = inMemory || {};
    current[episode] = { completed: true };
    // console.log(current[episode],feed,episode);
    await db.set(feed,current);
    if(fb){
      fb();
    }
    return true;
 }
 return false;
}

export const completeEpisode = (state) => {
  const {playlist} = state;
  const { player } = window;
  if ( playlist && playlist.length > 0 ) {
    
    const nextEpisode = playlist.shift();
    // Todo: Fix to use player in scope. This is a hack.
    player.src = nextEpisode.media;
    player.currentTime = nextEpisode.currentTime || 0;

    return { ...state, ...nextEpisode, playlist, refresh: Date.now() };

  } else {
    const cleanPayload = {
      episode: null,
      author: null,
      playing: null,
      status: null,
      episodeInfo: null,
      podcastImage: null,
      audioOrigin: null,
      media: null,
      played: null,
      currentTime: null,
      refresh: Date.now()
    };

    return {
      ...state,
      ...cleanPayload
    }
  }

}

export const recordEpisode = async (feed, episode, currentTime, duration) => {
  //console.log('record')
  const inMemory = await db.get(feed);
  const current = inMemory || {};
  current[episode] = { completed: false, currentTime, duration, duration };
  return await db.set(feed,current);
}

export const updateMediaSessionState = (value) => {
  if ('mediaSession' in navigator) {
    navigator.mediaSession.playbackState = value;
  }
}

export const checkIfMediaSessionLodaded = (state) =>{
  if ('mediaSession' in navigator && navigator.mediaSession.metadata === null) {
    const { episodeInfo, podcastAuthor, podcastImage, title } = state;
    const { title: episodeTitle } = episodeInfo;


    navigator.mediaSession.metadata = new MediaMetadata({
      title: episodeTitle,
      artist: podcastAuthor,
      album: title,
      artwork: [
        { src: podcastImage,  sizes: '96x96',   type: 'image/png' },
        { src: podcastImage, sizes: '128x128', type: 'image/png' },
        { src: podcastImage, sizes: '192x192', type: 'image/png' },
        { src: podcastImage, sizes: '256x256', type: 'image/png' },
        { src: podcastImage, sizes: '384x384', type: 'image/png' },
        { src: podcastImage, sizes: '512x512', type: 'image/png' },
      ]
    });
  }
}

const defaultState = {
    podcasts: [],
    theme: true,  
    current: null,

    status: null,
    playing: null,
    loaded: 0,
    played: 0,
    status: null,
    audioOrigin:"",
    loading: false,

    title: "",
    image: null,
    episode: null,
    episodeInfo:null,

    playlist: [],

    currentTime: null,
    media:"",
    refresh: Date.now()
  };

  const initialState = JSON.parse(localStorage.getItem('state') || false ) || defaultState;

// cleanup legacy
delete initialState['items'];
delete initialState['description'];
delete initialState['image'];
delete initialState['link'];
delete initialState['created'];

export { initialState };

export const reducer = (state, action) => {
    switch(action.type){
      case 'updatePodcasts':
      case 'initLibrary':
        return { ...state, podcasts: action.podcasts}
      case 'loadPodcast':
        return { ...state, current: action.payload }
      case 'setDark':
        return { ...state, theme: action.payload }
      case 'playingStatus':
        const {status} = action;
        updateMediaSessionState(status);
        checkIfMediaSessionLodaded(state);
        return {...state, status} 
      case 'updateCurrent':
          return {...state, current: action.payload} 
      case 'addNext': {
        const {playlist = []} = state;
          playlist.unshift(action.payload);
          return {...state, playlist }
      }
      case 'addLast': {
          const {playlist = []} = state;
          playlist.push(action.payload);
          return {...state, playlist } 
      }
      case 'audioCompleted':
        const guid = state.episodeInfo && state.episodeInfo.guid;
        completeEpisodeHistory(state.current, guid);
        return completeEpisode(state);
      case 'audioUpdate':
        updateMediaSessionState(action.payload.status);
        if(action.payload && (action.payload.status === 'paused')){
          recordEpisode(state.audioOrigin,state.episodeInfo.guid,state.currentTime, state.duration);
          return { ...state, ...action.payload, refresh: Date.now() }
        }else {
          return { ...state, ...action.payload}
        }
      case 'removeFromPlayList':
        const {episode} = action;
        const {playlist} = state;
        playlist.splice(episode,1);
        return {...state, playlist};
      case 'clearPlayList':
        return {...state, playlist:[]};
      case 'resetState':
        return defaultState;
      case 'drawer':{
        const {status, drawerContent } = action.payload;
        if(!status){
          return {...state, drawer: false }
        }
        return {...state, drawer: true, drawerContent };
      }
    }
  }
