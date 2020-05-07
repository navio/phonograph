const initialState = JSON.parse(localStorage.getItem('state') || false ) || {
    playing: null,
    loaded: 0,
    played: 0,
    status: null,
    title: "",
    image: null,
    loading: false,
    podcasts: [],
    theme: true,
    current: null
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
      case 'audioUpdate':
        return { ...state, ...action.payload}
    }
  }