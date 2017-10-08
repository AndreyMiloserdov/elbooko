import './TypeMissedSymbols.scss';

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import PlayAudio from './PlayAudio';
import shuffle from '../utils/shuffle';
import random from '../utils/random';
import buildSymbolsState2 from '../utils/build-symbols-state-2';

const KEYBOARD = [
  [ 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p' ],
  [ 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  [ 'z', 'x', 'c', 'v', 'b', 'n', 'm'],
  [ 'space-bar' ]
];

class TypeMissedSymbols extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    onComplete: PropTypes.func.isRequired,
    instanceTimestamp: PropTypes.number.isRequired,
    numberOfSymbols: PropTypes.number.isRequired,
    numberOfRepeats: PropTypes.number.isRequired
  }

  static TYPE = 'type-missed-symbols';
  static NAME = 'Написание слов';

  constructor(props) {
    super(props);

    this.nextIteration = [];
    this.attemptsOverall = 0;
    this.attemptsFailured = 0;
    this.timeStarted = Date.now();

    this.state = this._initState();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.instanceTimestamp !== this.props.instanceTimestamp) {
      this._refresh();
    }
  }

  _initState() {
    return this._newInstance(
      this.props.model.cards.map((card) => ({
        ...card,
        symbolsUseModel: card.eng.split('').map(() => ({
          used: 0,
          failured: 0,
          max: this.props.numberOfRepeats
        }))
      }))
    );
  }

  _refresh(fromConstructor) {
    this.nextIteration = [];
    this.attemptsOverall = 0;
    this.attemptsFailured = 0;
    this.timeStarted = Date.now();

    this.setState(this._initState());
  }

  _newInstance(cardsToUse) {
    const cards = shuffle(cardsToUse.slice(0));
    const cardInx = 0; // start index of card
    const card = cards[cardInx];
    const symbols = card.eng.split('');
    const symbolsState = buildSymbolsState2(card.symbolsUseModel, this.props.numberOfSymbols);
    const symbolsInsertInx = symbolsState.indexOf(true);

    this.nextIteration.length = 0;
    this.attemptsOverall += cards.reduce((prev, next) => (prev + next.eng.length), 0);

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
    // get current card info
    const cards = this.state.cards;
    const card = cards[this.state.cardInx];
    const cardInx = this.state.cardInx + 1;
    const usedTotal = card.symbolsUseModel.reduce((prev, next) => (prev + next.used), 0);
    const failuredSymbols = card.symbolsUseModel.reduce((prev, next) => (prev + next.failured), 0);

    // если были промахи с буквами у слова - добавляем его на второй круг
    if (failuredSymbols > 0) {
      this.nextIteration.push(card);
    } else
    // либо мы должны проверить ввод каждого символа <numberOfRepeats> раз
    if (usedTotal < card.eng.length * this.props.numberOfRepeats) {
      this.nextIteration.push(card);
    }

    // если карточки кончились, то проверяем наличие запаски
    if (cardInx === this.state.cards.length) {
      // если запаски нет: завершаем данную активность
      if (this.nextIteration.length === 0) {
        this.props.onComplete({
          spentTime: Date.now() - this.timeStarted,
          attemptsFailured: this.attemptsFailured / this.attemptsOverall
        });
      }
      // если запаска есть: используем ее для новой итерации
      else {
        this.setState(
          this._newInstance(this.nextIteration)
        );
      }
    }
    // если карточки еще есть, формируем новый набор 
    else {
      const card = cards[cardInx];
      const symbols = card.eng.split('');
      const symbolsState = buildSymbolsState2(card.symbolsUseModel, this.props.numberOfSymbols);
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
    return this.state.disabledKeyboardBttns
              .map((row) => row.map((v) => v));
  }

  _keyboardKeyPress(inxRow, inxBtn) {
    const card = this.state.cards[this.state.cardInx];
    const sii = this.state.symbolsInsertInx;
    const key = KEYBOARD[inxRow][inxBtn];
    const correct = card.eng[sii] === key;
    const state = {};

    // выбор верный:
    if (correct) {
      // помечаем что буква на текущей позиции была уже использована
      card.symbolsUseModel[sii].used += 1;

      // апдейтим стейт на новую букву
      state.symbolsState = this.state.symbolsState.slice(0);
      state.symbolsState[sii] = false;
      state.symbolsInsertInx = state.symbolsState.indexOf(true);
      state.disabledKeyboardBttns = this._newKeysState();

      // если пропущенной буквы не найдено - завершение
      if (state.symbolsInsertInx === -1) {
        state.showFeedback = true;
      }
    }
    // если выбор не верный
    else {
      // увеличиваем общий счетчик фейлов
      this.attemptsFailured += 1;

      // увеличиваем счетчик фейлов для буквы
      card.symbolsUseModel[sii].failured += 1;

      // дизейблим кнопку of keyboard
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
      <div className="screen type-missed-symbols">
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

export default TypeMissedSymbols;
