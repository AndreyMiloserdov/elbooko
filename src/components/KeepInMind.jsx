import './KeepInMind.scss';

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import shuffle from '../utils/shuffle';
import random from '../utils/random';
import PlayAudio from './PlayAudio';

const BTTN_TEXT = shuffle([
  'Следующее слово!',
  'Запомнила, дальше!',
  'Вперед!',
  'Это было легко! Следующее слово',
  'Еще!',
  'Пфф... легкотня, дальше'
]);

class Choose extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    onComplete: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);

    this.state = this._newInstance();

    this.actions = {
      reset: this._reset.bind(this),
      cardNext: this._cardNext.bind(this),
      finishScreen: this._finishScreen.bind(this)
    };
  }

  _reset() {
    this.setState(this._newInstance());
  }

  _newInstance() {
    return {
      cardInx: 0,
      isNoCard: false,
      cards: shuffle(this.props.model.cards.slice(0)),
      bttnText: BTTN_TEXT[random(BTTN_TEXT.length - 1)]
    };
  }

  _cardNext() {
    let cardInx = this.state.cardInx + 1;
    let cards = this.state.cards;

    if (cardInx === cards.length) {
      this.setState({
        isNoCard: true
      });
    } else {
      this.setState({
        cardInx,
        bttnText: BTTN_TEXT[random(BTTN_TEXT.length - 1)]
      });
    }
  }

  _finishScreen() {
    this.props.onComplete();
  }

  render() {
    if (module.hot) {
      window.console.log('ARP state: ', this.state.cards);
    }

    const card = this.state.cards[this.state.cardInx] || {};

    return (
      <div className="screen choose">
        <div style={{display: this.state.isNoCard ? 'none' : ''}}>
          <PlayAudio
            image={card.image}
            audio={card.audio}/>
          <div
            className="card-eng">{card.eng}</div>
          <div
            className="card-rus">{card.rus}</div>
          <input
            type="button"
            value={this.state.bttnText}
            onClick={this.actions.cardNext}/>
        </div>
        <div style={{display: this.state.isNoCard ? '' : 'none'}}>
          <input
            type="button"
            value="Хочу еще раз изучить слова"
            onClick={this.actions.reset}/>
          <input
            type="button"
            value="Все запомнила, перейти к проверке на скорость"
            onClick={this.actions.finishScreen}/>
        </div>
      </div>
    );
  }
}

export default Choose;
