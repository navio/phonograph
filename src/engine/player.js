
import {driveThruDNS} from './podcast';
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

export const playButton = 
    function(ev) {
        let guid = ev.currentTarget.getAttribute('data-guid');
        let episode = this.episodes.get(guid);
        console.log(ev)
        if (this.state.playing === guid) {
            
            if (this.state.status === 'pause') {
                console.log('playing');
                this.refs.player.play();
                this.setState({ status: 'playing' });
            } else {
                console.log('pause');
                this.setState({ status: 'pause' });
                this.refs.player.pause();
            }

        } else { console.log('playing')
            this.refs.player.setAttribute("src", driveThruDNS(episode.enclosures[0].url));
            this.refs.player.play();
            this.setState({
                episode: episode.guid,
                author: episode.itunes_author,
                playing: guid,
                status: 'playing'
            });
        }
  }