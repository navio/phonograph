import React, { Component } from 'react';
import { render } from 'react-dom';
let Parser = new window.RSSParser();
const CORS_PROXY = "/rss/"; 
//"https://cors-anywhere.herokuapp.com/"
const url = "www.npr.org/rss/podcast.php?id=510289";

class App extends Component {
  constructor() {
    super();
    
    this.state = {
      name: 'React',
      items: null
    };
  }
  componentDidMount(){
    Parser.parseURL(CORS_PROXY+url)
    .then(x=>this.setState({items:x.items}));
  }

  render() {
    console.log('a',this.state.items)
    return (
      <div>
        <ol>
         {this.state.items && 
          this.state.items.map(item=><li><a href="{item.link}">
          {item.title}</a></li>)}
        </ol>
      </div>
    );
  }
}

render(<App />, document.getElementById('root'));
