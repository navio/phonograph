import React, { Component } from 'react';
import { render } from 'react-dom';
let Parser = new window.RSSParser();
const CORS_PROXY = "/rss/"; 
const url = "www.npr.org/rss/podcast.php?id=510289";

class App extends Component {
  constructor() {
    super();
    this.state = {
      name: 'React',
      items: null,
      src:null
    };
    this.playerHandler = this.playerHandler.bind(this);
  }
  playerHandler(ev){
    let src = ev.target.getAttribute('data-src');
    this.setState({src});
  }
  componentDidMount(){
    Parser.parseURL(CORS_PROXY+url)
    .then(x=>this.setState({items:x.items}));
  }
  toMinutes(time){
    return Math.floor( 1* time / 60 ) + ':'+ (1*time%60);
  }
  render() {
    return (
      <div>
        <audio autoPlay="true" src={this.state.src} ref="player"/>
        <ol>
         {this.state.items && 
          this.state.items.map(item=><li><a href="{item.link}">
          {item.title}</a> ({this.toMinutes(item.itunes.duration)}) <a onClick={this.playerHandler} data-src={item.enclosure.url}>PLAY</a><br />{item.content}
          
          </li>)}
        </ol>
      </div>
    );
  }
}

render(<App />, document.getElementById('root'));
