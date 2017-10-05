import './PlayAudio.scss';

import PropTypes from 'prop-types';
import React, { Component } from 'react';

class PlayAudio extends Component {
  static propTypes = {
    image: PropTypes.string,
    audio: PropTypes.array.isRequired
  }

  constructor(props) {
    super(props);

    this.audio = [];

    this.state = {
      current: 0
    };

    this.actions = {
      
    };
  }

  _setAudio(node, inx) {
    this.audio[inx] = node;
  }

  _playSound() {
    this.audio[this.state.current].play();
    this.setState({
      disabled: true
    });
  }

  _nextSound() {
    let current = this.state.current + 1;

    if (current === this.audio.length) {
      current = 0;
    }

    this.setState({
      current,
      disabled: false
    });
  }

  render() {
    const playSound = () => this._playSound();

    return (
      <div className="audio-controller">
        {
          this.props.image
          ? <img src={this.props.image} onClick={playSound}/>
          : <button onClick={() => this._playSound()} disabled={this.state.disabled}></button>
        }
        {this.props.audio.map(
          (src, inx) => (
            <audio
              key={inx}
              src={src}
              onEnded={() => this._nextSound()}
              ref={(ref) => this._setAudio(ref, inx)}/>
          )
        )}
      </div>
    );
  }
}

export default PlayAudio;
