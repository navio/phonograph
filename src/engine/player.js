

export const forward30Seconds = 
    function(){  
        let player = this.refs.player;
        player.currentTime += 30;

        let loaded = (player.buffered.length) ? (100 * player.buffered.end(0) / player.duration) : 0;
  
        this.setState({ loaded, 
                        played: (100 * player.currentTime / player.duration), 
                        currentTime: player.currentTime, 
                        duration: player.duration });
    }

export const rewind10Seconds = 
    function (){
        let player = this.refs.player;
        player.currentTime -= 10;

        let loaded = (player.buffered.length) ? (100 * player.buffered.end(0) / player.duration) : 0;
  
        this.setState({ loaded, 
                        played: (100 * player.currentTime / player.duration), 
                        currentTime: player.currentTime, 
                        duration: player.duration });
    }