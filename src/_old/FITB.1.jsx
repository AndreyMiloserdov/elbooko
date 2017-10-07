import './FITB.scss';

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import PlayAudio from './PlayAudio';
import shuffle from '../utils/shuffle';
import buildSymbols from '../utils/build-symbols';

const KEYBOARD = [
  [ 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p' ],
  [ 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l']
  [ 'z', 'x', 'c', 'v', 'b', 'n', 'm']
];

const BOX = [ 'empty', 'current', 'done' ];

class FITB extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    onComplete: PropTypes.func.isRequired,
    keyboard: PropTypes.number.isRequired
  }

  constructor(props) {
    super(props);

    this.items = this._buildItems();
  }

  componentWillMount() {
    this._getItem();
  }

  _buildItems() {
    return shuffle(this.props.model.items.slice(0))
      .map((item) => ({
        ...item,
        isFinished: false,
        symbols: item.eng.split('')
      }));
  }

  _getItem() {
    const len = this.items.length;
    let foundNotFinished = false;
    let item;

    for (let i = len; i--;) {
      item = this.items[i];
      
      if (item.isFinished) {
        continue;
      }

      foundNotFinished = true;
      break;
    }

    const symbols = item.eng.split('');

    if (foundNotFinished) {
      this.setState({
        item,
        symbols: buildSymbols(item.eng, this.props.keyboard),
        symbolsOrigin: symbols,
        symbolsClass: symbols.map((s, inx) => inx === 0 ? 1 : 0),
        symbolsDisabled: [],
        symbolsEnter: '',
        showFeedback: false
      });
    } else {
      this.props.onComplete();
    }
  }

  _keyboardKeyPress(evt) {
    const enter = this.state.symbolsEnter + evt.target.textContent;
    const correct = this.state.item.eng.indexOf(enter) === 0;
    const state = {};

    if (!correct) {
      return;
    }

    const symbolsDisabled = this.state.symbolsDisabled.slice(0);
    const symbolsClass = this.state.symbolsClass.slice(0);
    const inx = parseInt(evt.target.name);
    const symbolInx = enter.length;
    let showFeedback = false;

    symbolsDisabled[inx] = true;
    symbolsClass[symbolInx - 1] = 2;

    if (enter === this.state.item.eng) {
      showFeedback = true;
      this.state.item.isFinished = true;
    } else {
      symbolsClass[symbolInx] = 1;
    }

    this.setState({
      showFeedback,
      symbolsClass,
      symbolsDisabled,
      symbolsEnter: enter      
    });
  }

  _renderFeedback() {
    return (
      <button
        onClick={() => this._getItem()}>Молодец! Следующиее слово!</button>
    );
  }

  _renderKeyboard() {
    return this.props.keyboard === Infinity
      ? this._renderFullKeyboard()
      : this._renderShortKeyboard()
  }

  _renderFullKeyboard() {
    return null;
  }

  _renderShortKeyboard() {
    const sd = this.state.symbolsDisabled;

    return (
      <div className="fitb-keyboard" onClick={(evt) => this._keyboardKeyPress(evt)}>
        {this.state.symbols.map(
          (symbol, inx) => (
            <button
              key={inx}
              name={inx}
              disabled={sd[inx] === true}>{symbol}</button>
          )
        )}
      </div>
    )
  }

  render() {
    const cls = this.state.symbolsClass;
    const si = this.state.symbolsEnter;

    return (
      <div className="screen fitb">
        Напиши праивльно слово: {this.state.item.rus}
        <div className="input-box">
          <div className="input-answer">
            {
              this.state.symbolsOrigin.map((s, inx) => (
                <span className={BOX[cls[inx]]} key={inx}>
                  {
                    si[inx] ? si[inx] : ''
                  }
                </span>
              ))
            }
          </div>
        </div>
        {
          this.state.showFeedback
            ? this._renderFeedback()
            : this._renderKeyboard()
        }
      </div>
    );
  }
}

export default FITB;
