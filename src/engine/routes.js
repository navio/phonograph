import {LIBVIEW, CASTVIEW} from '../constants'

export const viewAll = function(ev){
    this.setState({view:LIBVIEW});
}

export const viewCurrenPodcast = function(ev){
    this.setState({view:CASTVIEW});
}

export const viewSettings = function(ev){
    this.setState({view:CASTVIEW});
}