import './Loading.scss';

import React, { Component } from 'react';

class Loading extends Component {
  constructor(props) {
    super(props);

    this.state = {

    };

    this.actions = {
      
    };
  }

  componentWillMount() {

  }

  render() {
    if (module.hot) {
      window.console.log('ARP state: ', this.props.state);
    }

    return (
      <div className="screen loading">
        Please wait...
      </div>
    );
  }
}

export default Loading;
