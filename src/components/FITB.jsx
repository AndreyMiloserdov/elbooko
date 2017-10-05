import './FITB.scss';

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import PlayAudio from './PlayAudio';
import shuffle from '../utils/shuffle';
import random from '../utils/random';
import buildSymbolsState from '../utils/build-symbols-state';

const KEYBOARD = [
  [ 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p' ],
  [ 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  [ 'z', 'x', 'c', 'v', 'b', 'n', 'm'],
  [ 'space-bar' ]
];

const BOX = [ 'empty', 'current', 'done' ];

class FITB extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    onComplete: PropTypes.func.isRequired
  }

  static TYPE = 'fitb';
  static NAME = 'Написание слов';

  constructor(props) {
    super(props);

    this.nextIteration = [];
    this.attemptsOverall = 0;
    this.attemptsFailured = 0;
    this.timeStarted = Date.now();
    
    this.state = this._newInstance(this.props.model.cards);
  }

  _newInstance(cardsToUse) {
    const cardInx = 0;
    const cards = shuffle(cardsToUse.slice(0)).map((card) => ({
      ...card,
      symbolsInsertNum: isNaN(card.symbolsInsertNum) ? 1 : card.symbolsInsertNum + 1
    }));
    const card = cards[cardInx];
    const symbols = card.eng.split('');
    const symbolsState = buildSymbolsState(symbols, card.symbolsInsertNum);
    const symbolsInsertInx = symbolsState.indexOf(true);

    this.nextIteration.length = 0;
    this.attemptsOverall += cards.reduce((prev, next) => prev + next.eng.length, 0);

    return {
      cards,
      cardInx,
      symbols,
      symbolsState,
      symbolsInsertInx,
      isFinished: false,
      showFeedback: false,
      disabledKeyboardBttns: this._newKeysState()
    };
  }

  _cardNext() {
    const cards = this.state.cards;
    const card = cards[this.state.cardInx];
    const cardInx = this.state.cardInx + 1;

    if (card.symbolsInsertNum < card.eng.length) {
      this.nextIteration.push(card);
    }

    if (cardInx === this.state.cards.length) {
      if (this.nextIteration.length === 0) {
        this.props.onComplete({
          spentTime: Date.now() - this.timeStarted,
          attemptsFailured: this.attemptsFailured / this.attemptsOverall
        });
      } else {
        this.setState(
          this._newInstance(this.nextIteration)
        );
      }
    } else {
      const card = cards[cardInx];
      const symbols = card.eng.split('');
      const symbolsState = buildSymbolsState(symbols, card.symbolsInsertNum);
      const symbolsInsertInx = symbolsState.indexOf(true);

      this.setState({
        cardInx,
        symbols,
        symbolsState,
        symbolsInsertInx,
        isFinished: false,
        showFeedback: false,
        disabledKeyboardBttns: this._newKeysState()
      });
    }
  }

  _newKeysState() {
    return KEYBOARD.map((row) => row.map((key) => false));
  }

  _copyKeysState() {
    return this.state.disabledKeyboardBttns.map((row) => row.map((v) => v));
  }

  _keyboardKeyPress(inxRow, inxBtn) {
    const card = this.state.cards[this.state.cardInx];
    const sii = this.state.symbolsInsertInx;
    const key = KEYBOARD[inxRow][inxBtn];
    const correct = card.eng[sii] === key;
    const state = {};

    if (correct) {
      state.symbolsState = this.state.symbolsState.slice(0);
      state.symbolsState[sii] = false;
      state.symbolsInsertInx = state.symbolsState.indexOf(true);

      if (state.symbolsInsertInx === -1) {
        state.showFeedback = true;
      }
    } else {
      this.attemptsFailured += 1;

      state.disabledKeyboardBttns = this._copyKeysState();
      state.disabledKeyboardBttns[inxRow][inxBtn] = true;
    }

    this.setState(state);
  }

  _renderKeyboard() {
    const ds = this.state.disabledKeyboardBttns;
    const keyboardStyle = {
      display: this.state.showFeedback ? 'none' : ''
    };

    return (
      <div className="keyboard" style={keyboardStyle}>
        {
          KEYBOARD.map((row, inxRow) => (
            <div className="row-of-bttns" key={inxRow}>
              {
                row.map((btn, inxBtn) => (
                  <button
                    key={inxBtn}
                    disabled={ds[inxRow][inxBtn]}
                    className={'bttn-key-' + btn}
                    onClick={() => this._keyboardKeyPress(inxRow, inxBtn)}>{btn}</button>
                ))
              }
            </div>
          ))
        }
      </div>
    );
  }

  render() {
    const card = this.state.cards[this.state.cardInx];
    const si = this.state.symbolsInsertInx;
    const ss = this.state.symbolsState;
    const feedbackStyle = {
      display: this.state.showFeedback ? '' : 'none'
    };

    return (
      <div className="screen fitb">
        <div>
          <img src={card.image}/>
          <div className="input-box">
            <div className="input-answer">
              {
                this.state.symbols.map((s, inx) => {
                  const className = [inx === si ? 'current' : ''];

                  if (ss[inx] === true) {
                    className.push('empty');
                  }

                  return (
                    <span
                      key={inx}
                      className={className.join(' ')}>
                      {
                        ss[inx] ? '' : s
                      }
                    </span>
                  );
                })
              }
            </div>
          </div>
          {
            this._renderKeyboard()
          }
          <div className="feedback" style={feedbackStyle}>
            <button
              onClick={() => this._cardNext()}
              >Отлично! следующее слово</button>
          </div>
        </div>
      </div>
    );
  }
}

export default FITB;
