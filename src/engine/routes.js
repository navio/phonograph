import {LIBVIEW, CASTVIEW, DISCOVERVIEW,SETTINGSVIEW} from '../constants'

export const viewAll = function(ev){
    this.setState({view:LIBVIEW});
}

export const viewCurrenPodcast = function(ev){
    this.setState({view:CASTVIEW});
}

export const viewSettings = function(ev){
    this.setState({view:SETTINGSVIEW});
}

export const viewDiscover = function(){
    this.setState({view:DISCOVERVIEW});
}