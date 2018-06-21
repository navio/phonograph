
  const completedLoading = function(ev){
    this.setState({loading:'loaded'});
  }

  const completedPlaying = function(ev){
    this.setState({
      episode: null,
      author: null,
      playing: null,
      status:null
    });
  }

  const eventEcho = function(ev){
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') console.log(ev.type,window.player.buffered,ev);
  }

  const playTick = function(ev){
    this.setState({status: 'playing'});
    this.tick = setInterval(()=>{ 
      let player = this.refs.player;
      let loaded = (player.buffered.length) ? (100 * player.buffered.end(0) / player.duration) : 0;
      this.setState({ loaded,
                      
                      played: (100 * player.currentTime / player.duration), 
                      currentTime: player.currentTime, 
                      duration: player.duration });
    },500);
  }
  
  const progress = function(ev){
    let player = this.refs.player;
    let loaded = (player.buffered.length) ? (100 * player.buffered.end(0) / player.duration) : 100;
    this.setState({loaded});
  }

  const pauseTick = function(ev){
    clearInterval(this.tick);
    this.setState({
      status:'pause'
    });
  }

  export default function(player){
    // Initialization
    // player.addEventListener('loadstart',this.loading.bind(this)); 
    player.addEventListener('loadeddata',eventEcho.bind(this)); 
    player.addEventListener('progress',progress.bind(this));
    player.addEventListener('canplaythrough',eventEcho.bind(this));

    // User Events
    player.addEventListener('play',playTick.bind(this));
    player.addEventListener('pause',pauseTick.bind(this));
    
    // Media Events
    player.addEventListener('canplay',completedLoading.bind(this))
    player.addEventListener('ended', completedPlaying.bind(this));
  }