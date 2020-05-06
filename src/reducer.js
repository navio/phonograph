import PS from 'podcastsuite';

const db = PS;
console.log(db, PS)

const completeEpisode = async (feed,episode) => {
  // const inMemory = await db.get(feed) || {};
  // const current = JSON.parse(inMemory);
  // current[episode] = {completed: true };

  await db.set(feed,current);
}

const recordEpisode = async (feed,episode,state) => {
  // const inMemory = await db.get(feed) || {};
  // const current = JSON.parse(inMemory);
  // current[episode] = {completed: false, currentTime:state.currentTime };

  // await db.set(feed,current);
}

export const initialState = JSON.parse(localStorage.getItem('state') || false ) || {
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
        if(action.status === paused){
          recordEpisode(state.audioOrigin,state.episode,state);
        }
        return {...state, status: action.status} 
      case 'updateCurrent':
          return {...state, current: action.payload} 
      case 'audioCompleted':
        completeEpisode(state.audioOrigin,state.episode);
        return { ...state, ...action.payload}
      case 'audioUpdate':
        return { ...state, ...action.payload}
    }
  }