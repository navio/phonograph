import PS from 'podcastsuite';
const db = PS.createDatabase('history','podcasts');

export const completeEpisode = async (feed,episode) => {
 if(feed && episode) {
    const inMemory = await db.get(feed);
    const current = inMemory || {};
    current[episode] = { completed: true };
    console.log(current[episode],feed,episode);
    await db.set(feed,current);
    return true;
 }
 return false;
}

export const recordEpisode = async (feed, episode, currentTime, duration) => {
  console.log('record')
  const inMemory = await db.get(feed);
  const current = inMemory || {};
  current[episode] = { completed: false, currentTime, duration, duration };
  return await db.set(feed,current);
}
const initialState = JSON.parse(localStorage.getItem('state') || false ) || {
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

    currentTime: null,
    media:"",
    refresh: Date.now()

  };

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
        return {...state, status: action.status} 
      case 'updateCurrent':
          return {...state, current: action.payload} 
      case 'audioCompleted':
        completeEpisode(state.current, state.episodeInfo.guid);
        return { ...state, ...action.payload, refresh: Date.now()}
      case 'audioUpdate':
        if(action.payload && (action.payload.status === 'pause')){
          recordEpisode(state.audioOrigin,state.episodeInfo.guid,state.currentTime, state.duration);
          return { ...state, ...action.payload, refresh: Date.now() }
        }else {
        return { ...state, ...action.payload}
        }
    }
  }