export const clearNotification = function(){
  this.setState({notification:null})
}
export const addNotification = function(message,type,duration){
  this.setState({notification:{message,type,duration}});
}