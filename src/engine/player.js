

export const forward30Seconds = 
    function(){  console.log(this.refs.player)
        this.refs.player.currentTime += 30;
    }

export const rewind10Seconds = 
    function (){
        this.refs.player.currentTime -= 10;
    }