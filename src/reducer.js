import { set,get } from 'idb-keyval';

export const completeEpisode = async (feed,episode) => {
  const inMemory = await get(feed);
  const current = inMemory || {};
  current[episode] = { completed: true };
  return await set(feed,current);
}

export const recordEpisode = async (feed, episode, currentTime, duration) => {
  console.log('record')
  const inMemory = await get(feed);
  const current = inMemory || {};
  current[episode] = { completed: false, currentTime, duration, duration };
  return await set(feed,current);
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
    currentTime: null,
    media:""
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
        if(sate.episode) completeEpisode(state.audioOrigin,state.episode);
        return { ...state, ...action.payload}
      case 'audioUpdate':
        if(action.payload && (action.payload.status === 'pause')){
          recordEpisode(state.audioOrigin,state.episode,state.currentTime, state.duration);
        }
        return { ...state, ...action.payload}
    }
  }